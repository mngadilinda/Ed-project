from rest_framework.permissions import BasePermission

class IsApprovedEducator(BasePermission):
    message = "You must be an approved educator to access this resource."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role == 'EDUCATOR' and 
            request.user.is_approved
        )


class IsAdminUser(BasePermission):
    message = "You must be an admin to access this resource."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role == 'ADMIN'
        )