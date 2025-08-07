// 驗證工具類
class ValidationUtils {
  // 電子郵件驗證
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // 手機號碼驗證
  validatePhone(phone) {
    const phoneRegex = /^(\+?886|0)?9\d{8}$/;
    return phoneRegex.test(phone);
  }
  
  // 密碼強度驗證
  validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const score = [
      password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
    ].filter(Boolean).length;
    
    return {
      isValid: score >= 3,
      score,
      strength: this.getPasswordStrength(score),
      feedback: this.getPasswordFeedback(score),
    };
  }
  
  // 獲取密碼強度
  getPasswordStrength(score) {
    if (score <= 1) return 'weak';
    if (score <= 2) return 'fair';
    if (score <= 3) return 'good';
    if (score <= 4) return 'strong';
    return 'very-strong';
  }
  
  // 獲取密碼反饋
  getPasswordFeedback(score) {
    const feedbacks = [
      '密碼至少需要8個字符',
      '建議包含大寫字母',
      '建議包含小寫字母',
      '建議包含數字',
      '建議包含特殊字符',
    ];
    
    return feedbacks.slice(0, 5 - score);
  }
  
  // 用戶名驗證
  validateUsername(username) {
    const minLength = 3;
    const maxLength = 20;
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    
    if (username.length < minLength) {
      return { isValid: false, error: `用戶名至少需要${minLength}個字符` };
    }
    
    if (username.length > maxLength) {
      return { isValid: false, error: `用戶名不能超過${maxLength}個字符` };
    }
    
    if (!usernameRegex.test(username)) {
      return { isValid: false, error: '用戶名只能包含字母、數字和下劃線' };
    }
    
    return { isValid: true };
  }
  
  // 必填字段驗證
  validateRequired(value, fieldName = '此字段') {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return { isValid: false, error: `${fieldName}為必填項` };
    }
    return { isValid: true };
  }
  
  // 長度驗證
  validateLength(value, minLength, maxLength, fieldName = '此字段') {
    if (value.length < minLength) {
      return { isValid: false, error: `${fieldName}至少需要${minLength}個字符` };
    }
    
    if (value.length > maxLength) {
      return { isValid: false, error: `${fieldName}不能超過${maxLength}個字符` };
    }
    
    return { isValid: true };
  }
  
  // 數字範圍驗證
  validateNumberRange(value, min, max, fieldName = '此數值') {
    const num = parseFloat(value);
    
    if (isNaN(num)) {
      return { isValid: false, error: `${fieldName}必須是數字` };
    }
    
    if (num < min) {
      return { isValid: false, error: `${fieldName}不能小於${min}` };
    }
    
    if (num > max) {
      return { isValid: false, error: `${fieldName}不能大於${max}` };
    }
    
    return { isValid: true };
  }
  
  // URL驗證
  validateURL(url) {
    try {
      new URL(url);
      return { isValid: true };
    } catch {
      return { isValid: false, error: '請輸入有效的URL' };
    }
  }
  
  // 日期驗證
  validateDate(date) {
    const dateObj = new Date(date);
    return {
      isValid: !isNaN(dateObj.getTime()),
      error: isNaN(dateObj.getTime()) ? '請輸入有效的日期' : null,
    };
  }
  
  // 未來日期驗證
  validateFutureDate(date) {
    const dateObj = new Date(date);
    const now = new Date();
    
    if (isNaN(dateObj.getTime())) {
      return { isValid: false, error: '請輸入有效的日期' };
    }
    
    if (dateObj <= now) {
      return { isValid: false, error: '日期必須是未來日期' };
    }
    
    return { isValid: true };
  }
  
  // 過去日期驗證
  validatePastDate(date) {
    const dateObj = new Date(date);
    const now = new Date();
    
    if (isNaN(dateObj.getTime())) {
      return { isValid: false, error: '請輸入有效的日期' };
    }
    
    if (dateObj >= now) {
      return { isValid: false, error: '日期必須是過去日期' };
    }
    
    return { isValid: true };
  }
  
  // 信用卡號驗證
  validateCreditCard(cardNumber) {
    // 移除空格和連字符
    const cleanNumber = cardNumber.replace(/\s+/g, '').replace(/-/g, '');
    
    // 檢查長度
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      return { isValid: false, error: '信用卡號長度不正確' };
    }
    
    // Luhn算法驗證
    let sum = 0;
    let isEven = false;
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i));
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return {
      isValid: sum % 10 === 0,
      error: sum % 10 !== 0 ? '信用卡號無效' : null,
    };
  }
  
  // 身份證號驗證 (台灣)
  validateTaiwanID(id) {
    const idRegex = /^[A-Z][12]\d{8}$/;
    
    if (!idRegex.test(id)) {
      return { isValid: false, error: '身份證號格式不正確' };
    }
    
    // 字母對應的數字
    const letterMap = {
      A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17, I: 34,
      J: 18, K: 19, L: 20, M: 21, N: 22, O: 35, P: 23, Q: 24, R: 25,
      S: 26, T: 27, U: 28, V: 29, W: 32, X: 30, Y: 31, Z: 33,
    };
    
    const firstLetter = id.charAt(0);
    const letterValue = letterMap[firstLetter];
    
    if (!letterValue) {
      return { isValid: false, error: '身份證號字母不正確' };
    }
    
    // 計算檢查碼
    const digits = id.substring(1);
    const sum = Math.floor(letterValue / 10) + (letterValue % 10) * 9 +
                parseInt(digits.charAt(0)) * 8 + parseInt(digits.charAt(1)) * 7 +
                parseInt(digits.charAt(2)) * 6 + parseInt(digits.charAt(3)) * 5 +
                parseInt(digits.charAt(4)) * 4 + parseInt(digits.charAt(5)) * 3 +
                parseInt(digits.charAt(6)) * 2 + parseInt(digits.charAt(7)) * 1;
    
    const checkDigit = (10 - (sum % 10)) % 10;
    const lastDigit = parseInt(digits.charAt(8));
    
    return {
      isValid: checkDigit === lastDigit,
      error: checkDigit !== lastDigit ? '身份證號檢查碼錯誤' : null,
    };
  }
  
  // 統一編號驗證 (台灣)
  validateTaiwanUnifiedNumber(unifiedNumber) {
    const unifiedRegex = /^\d{8}$/;
    
    if (!unifiedRegex.test(unifiedNumber)) {
      return { isValid: false, error: '統一編號格式不正確' };
    }
    
    // 權重
    const weights = [1, 2, 1, 2, 1, 2, 4, 1];
    let sum = 0;
    
    for (let i = 0; i < 8; i++) {
      const digit = parseInt(unifiedNumber.charAt(i));
      const weight = weights[i];
      const product = digit * weight;
      
      if (product >= 10) {
        sum += Math.floor(product / 10) + (product % 10);
      } else {
        sum += product;
      }
    }
    
    return {
      isValid: sum % 10 === 0,
      error: sum % 10 !== 0 ? '統一編號無效' : null,
    };
  }
  
  // 表單驗證
  validateForm(formData, rules) {
    const errors = {};
    
    Object.keys(rules).forEach(fieldName => {
      const value = formData[fieldName];
      const fieldRules = rules[fieldName];
      
      // 必填驗證
      if (fieldRules.required) {
        const requiredResult = this.validateRequired(value, fieldRules.label || fieldName);
        if (!requiredResult.isValid) {
          errors[fieldName] = requiredResult.error;
          return;
        }
      }
      
      // 如果值為空且非必填，跳過其他驗證
      if (!value && !fieldRules.required) {
        return;
      }
      
      // 長度驗證
      if (fieldRules.minLength || fieldRules.maxLength) {
        const lengthResult = this.validateLength(
          value,
          fieldRules.minLength || 0,
          fieldRules.maxLength || Infinity,
          fieldRules.label || fieldName
        );
        if (!lengthResult.isValid) {
          errors[fieldName] = lengthResult.error;
          return;
        }
      }
      
      // 格式驗證
      if (fieldRules.pattern) {
        const regex = new RegExp(fieldRules.pattern);
        if (!regex.test(value)) {
          errors[fieldName] = fieldRules.patternMessage || '格式不正確';
          return;
        }
      }
      
      // 自定義驗證
      if (fieldRules.custom) {
        const customResult = fieldRules.custom(value, formData);
        if (!customResult.isValid) {
          errors[fieldName] = customResult.error;
          return;
        }
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
  
  // 實時驗證
  validateField(value, rules) {
    const errors = [];
    
    if (rules.required) {
      const requiredResult = this.validateRequired(value, rules.label);
      if (!requiredResult.isValid) {
        errors.push(requiredResult.error);
      }
    }
    
    if (value && rules.minLength) {
      const lengthResult = this.validateLength(value, rules.minLength, rules.maxLength || Infinity, rules.label);
      if (!lengthResult.isValid) {
        errors.push(lengthResult.error);
      }
    }
    
    if (value && rules.pattern) {
      const regex = new RegExp(rules.pattern);
      if (!regex.test(value)) {
        errors.push(rules.patternMessage || '格式不正確');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default new ValidationUtils();
