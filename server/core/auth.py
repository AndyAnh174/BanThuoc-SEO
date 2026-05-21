from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed


class SafeJWTAuthentication(JWTAuthentication):
    """
    JWT authentication that doesn't fail hard on invalid/expired tokens.

    Instead of raising AuthenticationFailed (which returns 401 before
    permission checks), it returns None so the request falls through
    to the permission class. This allows AllowAny views to work even
    when the client sends an expired JWT.
    """

    def authenticate(self, request):
        try:
            return super().authenticate(request)
        except (InvalidToken, AuthenticationFailed):
            return None
