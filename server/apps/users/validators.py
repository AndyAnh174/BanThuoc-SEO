import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

class ComplexPasswordValidator:
    """
    Validate whether the password contains at least one uppercase letter,
    one lowercase letter, and one digit.
    """
    def validate(self, password, user=None):
        if not re.search(r'[A-Z]', password):
            raise ValidationError(
                _("Mật khẩu phải chứa ít nhất một chữ viết hoa."),
                code='password_no_upper',
            )
        if not re.search(r'[a-z]', password):
            raise ValidationError(
                _("Mật khẩu phải chứa ít nhất một chữ viết thường."),
                code='password_no_lower',
            )
        if not re.search(r'[0-9]', password):
            raise ValidationError(
                _("Mật khẩu phải chứa ít nhất một chữ số."),
                code='password_no_digit',
            )

    def get_help_text(self):
        return _(
            "Mật khẩu của bạn phải chứa ít nhất một chữ viết hoa, một chữ viết thường và một chữ số."
        )
