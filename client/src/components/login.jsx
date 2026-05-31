import { useRef, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; 
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../hooks/useAuth";
import axios from "../api/axios";
import useInput from "../hooks/useInput";
import useToggle from "../hooks/useToggle";
import getAuthDataFromToken from "../utils/jwtUtils";
import "../css/auth.css";
import "../css/form.css";

const LOGIN_URL = "/login";

const Login = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Find where the user was trying to go before being redirected to login
  const from = location.state?.from?.pathname || "/";

  const emailRef = useRef();
  const errRef = useRef();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // Your custom state/localStorage hooks
  const [email, resetEmail, emailAttribs] = useInput("email", ""); 
  const [password, setPassword] = useState("");
  const [persist, setPersist] = useToggle("persist", false);

  // Auto-focus email field on mount
  useEffect(() => {
    emailRef.current.focus();
  }, []);

  // Clear errors when the user changes their credentials
  useEffect(() => {
    setErrMsg("");
  }, [email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowPassword(false);
    setIsLoading(true);
    setErrMsg("");

    try {
      const response = await axios.post(
        LOGIN_URL,
        JSON.stringify({ email, password }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      // Extract details and decode payload using your utility
      const accessToken = response?.data?.accessToken;
      const authData = getAuthDataFromToken(accessToken);

      // Commit fully to your global authentication pipeline
      setAuth({ email, token: accessToken, ...authData });

      // Clean out variables safely
      resetEmail("");
      setPassword("");

      // Bounce the user back to their intended route or root index
      navigate(from, { replace: true });

    } catch (err) {
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 400) {
        setErrMsg("Missing Email or Password");
      } else if (err.response?.status === 401) {
        setErrMsg("Unauthorized");
      } else {
        setErrMsg("Login Failed");
      }
      // Voice screen readers immediately to the alert container
      errRef.current.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" role="main">
        
        {/* Dynamic Screen Reader Friendly Alert Banner */}
        <p
          ref={errRef}
          className={errMsg ? "error-box" : "offscreen"}
          aria-live="assertive"
          tabIndex="-1"
          role="alert"
        >
          {errMsg}
        </p>

        <h2 className="auth-title" id="login-heading">Welcome Back</h2>

        <form onSubmit={handleSubmit} className="auth-form" aria-labelledby="login-heading">
          
          {/* --- EMAIL FIELD --- */}
          <div className="input-group">
            <label className="input-label" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              ref={emailRef}
              autoComplete="off"
              {...emailAttribs}
              required
              className="auth-input"
            />
          </div>

          {/* --- PASSWORD FIELD --- */}
          <div className="input-group">
            <label className="input-label" htmlFor="password">Password</label>
            <div className="input-box">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
                className="auth-input password-input-field"
              />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowPassword((prev) => !prev)}
                className="show-pwd-btn"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          {/* --- PERSIST CHECKBOX --- */}
          <div className="persist-container">
            <label htmlFor="persist" className="persist-label">
              <input
                type="checkbox"
                id="persist"
                onChange={setPersist}
                checked={persist}
                className="persist-checkbox"
              />
              Trust this device
            </label>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="toggle-text">
          Need an account? <Link to="/register" className="toggle-link">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;