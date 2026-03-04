import fs from 'fs';

const data = {
  en: {
    login_page: {
      error_email_first: "Please enter your email address first.",
      error_login_failed: "Login failed. Please check your credentials.",
      error_login_unexpected: "An unexpected error occurred during login.",
      error_signup_failed: "Sign up failed. Please check your details.",
      error_signup_unexpected: "An unexpected error occurred during signup.",
      error_google_init: "Failed to initialize Google login.",
      title: "My Garage Portal",
      step_email: "Enter your email to continue.",
      welcome_back: "Welcome back, {email}",
      step_password: "Enter your password.",
      step_signup: "Create your account.",
      email_label: "Email Address",
      btn_next: "NEXT",
      btn_google: "CONTINUE WITH GOOGLE",
      btn_password: "USE PASSWORD",
      new_user: "New User?",
      btn_new_account: "CREATE NEW ACCOUNT",
      password_label: "Password",
      btn_signin: "SIGN IN",
      fullname_label: "Full Name",
      create_password_label: "Create Password",
      password_hint: "Must be at least 8 characters.",
      btn_create_account: "CREATE ACCOUNT",
      terms_agree: "By signing in, you agree to our Terms of Service.",
      go_back_aria: "Go back",
      placeholder_name: "Jane Doe"
    },
    signup_page: {
      error_passwords_match: "Passwords do not match.",
      error_registration_failed: "Registration failed.",
      error_unexpected: "Something went wrong. Please try again.",
      title: "Join the Hub",
      subtitle: "Create an account for instant 24/7 dispatch.",
      fullname_label: "Full Name",
      email_label: "Email Address",
      builder_toggle_title: "I represent a Builder / Company",
      builder_toggle_desc: "Manage multiple job sites and access commercial pricing.",
      company_label: "Company Name",
      phone_label: "Phone Number",
      password_label: "Password",
      confirm_password_label: "Confirm Password",
      btn_create_account: "CREATE ACCOUNT",
      already_have_account: "Already have an account?",
      sign_in_link: "Sign in",
      placeholder_name: "John Doe",
      placeholder_company: "Acme Construction LLC"
    },
    profile_complete: {
      title: "Complete Your Profile",
      subtitle: "Add your name to finish staff setup.",
      error_missing_name: "Please enter your first and last name.",
      first_name_label: "First Name",
      last_name_label: "Last Name",
      btn_save: "Save and Continue"
    },
    portal_page: {
      builder_account: "Builder Account",
      builder_account_desc: "You have access to multi-site management features."
    }
  },
  es: {
    login_page: {
      error_email_first: "Por favor, ingrese su correo electrónico primero.",
      error_login_failed: "Error al iniciar sesión. Por favor, revise sus credenciales.",
      error_login_unexpected: "Ocurrió un error inesperado durante el inicio de sesión.",
      error_signup_failed: "Error al registrarse. Por favor, revise sus datos.",
      error_signup_unexpected: "Ocurrió un error inesperado durante el registro.",
      error_google_init: "No se pudo inicializar el inicio de sesión con Google.",
      title: "Mi Portal de Garaje",
      step_email: "Ingrese su correo electrónico para continuar.",
      welcome_back: "Bienvenido de nuevo, {email}",
      step_password: "Ingrese su contraseña.",
      step_signup: "Cree su cuenta.",
      email_label: "Correo Electrónico",
      btn_next: "SIGUIENTE",
      btn_google: "CONTINUAR CON GOOGLE",
      btn_password: "USAR CONTRASEÑA",
      new_user: "¿Usuario Nuevo?",
      btn_new_account: "CREAR NUEVA CUENTA",
      password_label: "Contraseña",
      btn_signin: "INICIAR SESIÓN",
      fullname_label: "Nombre Completo",
      create_password_label: "Crear Contraseña",
      password_hint: "Debe tener al menos 8 caracteres.",
      btn_create_account: "CREAR CUENTA",
      terms_agree: "Al iniciar sesión, acepta nuestros Términos de Servicio.",
      go_back_aria: "Regresar",
      placeholder_name: "Juan Pérez"
    },
    signup_page: {
      error_passwords_match: "Las contraseñas no coinciden.",
      error_registration_failed: "Error al registrarse.",
      error_unexpected: "Algo salió mal. Por favor, inténtelo de nuevo.",
      title: "Únase al Hub",
      subtitle: "Cree una cuenta para despacho instantáneo 24/7.",
      fullname_label: "Nombre Completo",
      email_label: "Correo Electrónico",
      builder_toggle_title: "Represento a una Constructora / Empresa",
      builder_toggle_desc: "Administre múltiples sitios de trabajo y acceda a precios comerciales.",
      company_label: "Nombre de la Empresa",
      phone_label: "Número de Teléfono",
      password_label: "Contraseña",
      confirm_password_label: "Confirmar Contraseña",
      btn_create_account: "CREAR CUENTA",
      already_have_account: "¿Ya tiene una cuenta?",
      sign_in_link: "Iniciar sesión",
      placeholder_name: "Juan Pérez",
      placeholder_company: "Acme Construction LLC"
    },
    profile_complete: {
      title: "Complete Su Perfil",
      subtitle: "Agregue su nombre para finalizar la configuración de personal.",
      error_missing_name: "Por favor, ingrese su nombre y apellido.",
      first_name_label: "Nombre",
      last_name_label: "Apellido",
      btn_save: "Guardar y Continuar"
    },
    portal_page: {
      builder_account: "Cuenta de Constructor",
      builder_account_desc: "Tiene acceso a funciones de administración de múltiples sitios."
    }
  },
  vi: {
    login_page: {
      error_email_first: "Vui lòng nhập địa chỉ email của bạn trước.",
      error_login_failed: "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.",
      error_login_unexpected: "Đã xảy ra lỗi không mong muốn trong quá trình đăng nhập.",
      error_signup_failed: "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.",
      error_signup_unexpected: "Đã xảy ra lỗi không mong muốn trong quá trình đăng ký.",
      error_google_init: "Không thể khởi tạo đăng nhập bằng Google.",
      title: "Cổng Thông Tin Gara",
      step_email: "Nhập email của bạn để tiếp tục.",
      welcome_back: "Chào mừng trở lại, {email}",
      step_password: "Nhập mật khẩu của bạn.",
      step_signup: "Tạo tài khoản của bạn.",
      email_label: "Địa chỉ Email",
      btn_next: "TIẾP THEO",
      btn_google: "TIẾP TỤC VỚI GOOGLE",
      btn_password: "SỬ DỤNG MẬT KHẨU",
      new_user: "Người dùng mới?",
      btn_new_account: "TẠO TÀI KHOẢN MỚI",
      password_label: "Mật khẩu",
      btn_signin: "ĐĂNG NHẬP",
      fullname_label: "Họ và Tên",
      create_password_label: "Tạo Mật khẩu",
      password_hint: "Phải có ít nhất 8 ký tự.",
      btn_create_account: "TẠO TÀI KHOẢN",
      terms_agree: "Bằng cách đăng nhập, bạn đồng ý với Điều khoản Dịch vụ của chúng tôi.",
      go_back_aria: "Quay lại",
      placeholder_name: "Nguyễn Văn A"
    },
    signup_page: {
      error_passwords_match: "Mật khẩu không khớp.",
      error_registration_failed: "Đăng ký thất bại.",
      error_unexpected: "Đã xảy ra lỗi. Vui lòng thử lại.",
      title: "Tham gia Hub",
      subtitle: "Tạo tài khoản để được điều động ngay lập tức 24/7.",
      fullname_label: "Họ và Tên",
      email_label: "Địa chỉ Email",
      builder_toggle_title: "Tôi đại diện cho một Nhà thầu / Công ty",
      builder_toggle_desc: "Quản lý nhiều công trường và tiếp cận giá thương mại.",
      company_label: "Tên Công ty",
      phone_label: "Số điện thoại",
      password_label: "Mật khẩu",
      confirm_password_label: "Xác nhận Mật khẩu",
      btn_create_account: "TẠO TÀI KHOẢN",
      already_have_account: "Bạn đã có tài khoản?",
      sign_in_link: "Đăng nhập",
      placeholder_name: "Nguyễn Văn A",
      placeholder_company: "Công ty Xây dựng Acme"
    },
    profile_complete: {
      title: "Hoàn Thiện Hồ Sơ Của Bạn",
      subtitle: "Thêm tên của bạn để hoàn tất thiết lập nhân viên.",
      error_missing_name: "Vui lòng nhập tên và họ của bạn.",
      first_name_label: "Tên",
      last_name_label: "Họ",
      btn_save: "Lưu và Tiếp tục"
    },
    portal_page: {
      builder_account: "Tài khoản Nhà thầu",
      builder_account_desc: "Bạn có quyền truy cập vào các tính năng quản lý đa công trường."
    }
  }
};

['en', 'es', 'vi'].forEach(lang => {
  const content = JSON.parse(fs.readFileSync(`messages/${lang}.json`, 'utf8'));
  Object.assign(content, data[lang]);
  fs.writeFileSync(`messages/${lang}.json`, JSON.stringify(content, null, 2) + '\n');
});
