from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.conf import settings
from .serializers import UserSerializer, UserRegistrationSerializer, ChangePasswordSerializer

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new user"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Registration successful'
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Login with email and password"""
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response(
            {'error': 'Email and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(request, username=email, password=password)

    if user is not None:
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Login successful'
        })

    return Response(
        {'error': 'Invalid email or password'},
        status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    """Get current user profile"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update current user profile"""
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change user password"""
    serializer = ChangePasswordSerializer(data=request.data)

    if serializer.is_valid():
        user = request.user

        # Check old password
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'error': 'Old password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Set new password
        user.set_password(serializer.validated_data['new_password'])
        user.save()

        return Response({'message': 'Password changed successfully'})

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_feedback(request):
    """Send user feedback via email"""
    from django.core.mail import send_mail

    # Get feedback data
    rating = request.data.get('rating', '')
    feedback_text = request.data.get('feedback', '')
    user_name = request.data.get('user_name', 'Anonymous')
    user_email = request.data.get('user_email', 'unknown@example.com')

    # Validate required fields
    if not rating or not feedback_text:
        return Response(
            {'error': 'Rating and feedback are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Prepare email content
        subject = f'Vamsapattika Feedback: {rating} - {user_name}'
        message = f"""
New Feedback Received from Vamsapattika

Rating: {rating}
User: {user_name}
Email: {user_email}

Feedback:
{feedback_text}

---
Sent via Vamsapattika Feedback System
"""

        # Send email
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=['support@vamsapattika.com'],
            fail_silently=False,
        )

        return Response({
            'message': 'Thank you for your feedback! We have received your message.'
        }, status=status.HTTP_200_OK)

    except Exception as e:
        # Log the error for debugging
        print(f'Error sending feedback email: {str(e)}')
        return Response(
            {'error': 'Failed to send feedback. Please try again later or email us directly at support@vamsapattika.com'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
