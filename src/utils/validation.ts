export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
    return { 
      valid: false, 
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
    };
  }
  
  return { valid: true };
};

export const validatePhone = (phone: string): boolean => {
  // Basic phone validation - can be enhanced for specific country formats
  const phoneRegex = /^\+?[0-9]{8,15}$/;
  return phoneRegex.test(phone);
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};

export const sanitizeHtml = (html: string): string => {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '');
};

// Form field validation helper
export const validateField = (
  fieldName: string, 
  value: string, 
  formData?: Record<string, any>
): { valid: boolean; message?: string } => {
  switch (fieldName) {
    case 'email':
      return { 
        valid: validateEmail(value), 
        message: validateEmail(value) ? undefined : 'Please enter a valid email address' 
      };
      
    case 'password':
      return validatePassword(value);
      
    case 'confirmPassword':
      return { 
        valid: formData?.password === value, 
        message: formData?.password === value ? undefined : 'Passwords do not match' 
      };
      
    case 'firstName':
    case 'lastName':
      return { 
        valid: validateName(value), 
        message: validateName(value) ? undefined : 'Name must be at least 2 characters' 
      };
      
    case 'phone':
      return { 
        valid: validatePhone(value), 
        message: validatePhone(value) ? undefined : 'Please enter a valid phone number' 
      };
      
    default:
      return { valid: true };
  }
}; 