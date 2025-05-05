import logging
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from firebase_admin import auth

# Initialize logger
logger = logging.getLogger(__name__)

# Get custom User model
User = get_user_model()

class FirebaseError(Exception):
    """Base class for Firebase authentication errors"""
    pass

class InvalidTokenError(FirebaseError):
    """Invalid or malformed Firebase token"""
    pass

class FirebaseAuthentication(JWTAuthentication):
    """
    Custom authentication backend that verifies Firebase ID tokens.
    Automatically creates User and UserProfile objects for new users.
    """
    
    def authenticate(self, request):
        """Main authentication method"""
        # Get authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        # Validate header format
        if not auth_header.startswith('Bearer '):
            return None
            
        try:
            # Extract and verify token
            id_token = auth_header.split('Bearer ')[1].strip()
            decoded_token = self._verify_token(id_token)
            
            # Get or create user
            return self._get_or_create_user(decoded_token)
            
        except FirebaseError as e:
            logger.warning(f"Firebase auth failed: {str(e)}")
            raise AuthenticationFailed(str(e))
        except Exception as e:
            logger.exception("Unexpected authentication error")
            raise AuthenticationFailed('Authentication service unavailable')

    def _verify_token(self, id_token):
        """Verify the Firebase ID token"""
        try:
            return auth.verify_id_token(id_token)
        except ValueError as e:
            raise InvalidTokenError('Invalid token format')
        except auth.InvalidIdTokenError:
            raise InvalidTokenError('Invalid or expired token')
        except auth.UserNotFoundError:
            raise InvalidTokenError('User not found in Firebase')
        except Exception as e:
            logger.error(f"Token verification failed: {str(e)}")
            raise FirebaseError('Could not verify credentials')

    def _get_or_create_user(self, decoded_token):
        """Handle user creation/retrieval"""
        firebase_uid = decoded_token.get('uid')
        email = decoded_token.get('email', '')
        name = decoded_token.get('name', '').split()
        
        if not firebase_uid:
            raise InvalidTokenError('Missing Firebase UID')
            
        # Get or create user
        user, created = User.objects.get_or_create(
            firebase_uid=firebase_uid,
            defaults={
                'username': email.split('@')[0] if email else firebase_uid,
                'email': email,
                'first_name': name[0] if name else '',
                'last_name': ' '.join(name[1:]) if len(name) > 1 else '',
            }
        )
        
        # Update email if changed in Firebase
        if email and user.email != email:
            user.email = email
            user.save(update_fields=['email'])
            
        return (user, None)