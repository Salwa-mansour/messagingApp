import { useRef, useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; 
import { faCheck, faTimes, faInfoCircle, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../context/AuthContext";
import axios from "../api/axios";
import "../css/auth.css";
import "../css/form.css";

// Your precise form validation criteria
const USER_REGEX = /^[a-zA-Z][a-zA-Z0-9-_]{3,23}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}/;

const REGISTER_URL = "/register";

const Register = () => {
  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const usernameRef = useRef();
  const errRef = useRef();

  const [isLoading, setIsLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [validName, setValidName] = useState(false);
  const [userFocus, setUserFocus] = useState(false);

  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);

  const [password, setPassword] = useState("");
  const [validPassword, setValidPassword] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState("");
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const [errMsg, setErrMsg] = useState("");
  const [success, setSuccess] = useState(false);

  // Set initial focus to the username field
  useEffect(() => {
    usernameRef.current.focus();
  }, []);

  // Live monitor username validation status
  useEffect(() => {
    const result = USER_REGEX.test(username);
    setValidName(result);
  }, [username]);

  // Live monitor email validation status
  useEffect(() => {
    const result = EMAIL_REGEX.test(email);
    setValidEmail(result);
  }, [email]);

  // Live monitor main password syntax and matching status
  useEffect(() => {
    const result = PASSWORD_REGEX.test(password);
    setValidPassword(result);
    const match = password === confirmPassword;
    setValidMatch(match);
  }, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowPwd(false);
    setIsLoading(true);
    setErrMsg("");

    // Final security check before sending payload to the server
    const v1 = USER_REGEX.test(username);
    const v2 = EMAIL_REGEX.test(email);
    const v3 = PASSWORD_REGEX.test(password);
    if (!v1 || !v2 || !v3 || !validMatch) {
      console.log("Validation failed on submit:", { username, email, password, confirmPassword });
      console.log("Validation results:", { v1, v2, v3, validMatch });
      setErrMsg("Invalid Entry-----");
      setIsLoading(false);
      return;
    }

    const data = {
      username: username.trim(),
      email: email.trim(),
      password: password.trim(),
      confirmPassword: confirmPassword.trim(),
    };

    try {
      const response = await axios.post(REGISTER_URL, data, {
        withCredentials: true,
      });

      // Safely access the data architecture returned by your back-end server
      const accessToken = response.data?.accessToken;
      const user = response.data?.user;

      // Seed authorization identity cleanly down into your app infrastructure
      setAuth({ token: accessToken, user });
      
      setSuccess(true);
      
      // Flush inputs out of local memory safely
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // Direct the user forward automatically into the core route layout
      setTimeout(() => {
        navigate("/chat");
      }, 1500);

    } catch (err) {
      
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.data?.error) {
        setErrMsg(err.response.data.error);
      } else if (err.response?.data?.message) {
        setErrMsg(err.response.data.message);
      } else {
        setErrMsg("Registration Failed");
      }
      // Force accessibility readers to vocalize the error container immediately
      errRef.current.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" role="main">
        {success ? (
          <section className="auth-success-view">
            <h2 className="auth-title">Success!</h2>
            <div className="success-box" role="status">
         Account created. Redirecting you to chat...
            </div>
            <p className="toggle-text">
              <Link to="/login" className="toggle-link">Click here if you aren't redirected</Link>
            </p>
          </section>
        ) : (
          <section>
            {/* Smooth dynamic warning box with focus tracking anchor */}
            <p
              ref={errRef}
              className={errMsg ? "error-box" : "offscreen"}
              aria-live="assertive"
              tabIndex="-1"
              role="alert"
            >
              {errMsg}
            </p>

            <h2 className="auth-title" id="register-heading">Create An Account</h2>

            <form onSubmit={handleSubmit} className="auth-form" aria-labelledby="register-heading">
              
              {/* --- USERnAME FIELD --- */}
              <div className="input-group">
                <label className="input-label" htmlFor="username">
                  Username:
                  <span className={validName ? "valid" : "hide"}>
                    <FontAwesomeIcon icon={faCheck} />
                  </span>
                  <span className={validName || !username ? "hide" : "invalid"}>
                    <FontAwesomeIcon icon={faTimes} />
                  </span>
                </label>
                <input
                  type="text"
                  id="username"
                  ref={usernameRef}
                  autoComplete="off"
                  onChange={(e) => setUsername(e.target.value)}
                  value={username}
                  required
                  aria-invalid={validName ? "false" : "true"}
                  aria-describedby="uidnote"
                  onFocus={() => setUserFocus(true)}
                  onBlur={() => setUserFocus(false)}
                  className="auth-input"
                />
                <p id="uidnote" className={userFocus && username && !validName ? "instructions" : "offscreen"}>
                  <FontAwesomeIcon icon={faInfoCircle} /> 4 to 24 characters.<br />
                  Must begin with a letter.<br />
                  Letters, numbers, underscores, hyphens allowed.
                </p>
              </div>

              {/* --- EMAIL FIELD --- */}
              <div className="input-group">
                <label className="input-label" htmlFor="email">
                  Email:
                  <span className={validEmail ? "valid" : "hide"}>
                    <FontAwesomeIcon icon={faCheck} />
                  </span>
                  <span className={validEmail || !email ? "hide" : "invalid"}>
                    <FontAwesomeIcon icon={faTimes} />
                  </span>
                </label>
                <input
                  type="email"
                  id="email"
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  required
                  aria-invalid={validEmail ? "false" : "true"}
                  aria-describedby="emailnote"
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => setEmailFocus(false)}
                  className="auth-input"
                />
                <p id="emailnote" className={emailFocus && email && !validEmail ? "instructions" : "offscreen"}>
                  <FontAwesomeIcon icon={faInfoCircle} /> Please enter a valid email address.<br />
                  Example: name@directory.com
                </p>
              </div>

              {/* --- PASSWORD FIELD --- */}
              <div className="input-group">
                <label className="input-label" htmlFor="password">
                  Password:
                  <span className={validPassword ? "valid" : "hide"}>
                    <FontAwesomeIcon icon={faCheck} />
                  </span>
                  <span className={validPassword || !password ? "hide" : "invalid"}>
                    <FontAwesomeIcon icon={faTimes} />
                  </span>
                </label>
                <div className="input-box">
                  <input
                    type={showPwd ? "text" : "password"}
                    id="password"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    required
                    aria-invalid={validPassword ? "false" : "true"}
                    aria-describedby="pwdnote"
                    onFocus={() => setPasswordFocus(true)}
                    onBlur={() => setPasswordFocus(false)}
                    className="auth-input password-input-field"
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowPwd((prev) => !prev)}
                    className="show-pwd-btn"
                    aria-label={showPwd ? "Hide password" : "Show password"}
                  >
                    <FontAwesomeIcon icon={showPwd ? faEyeSlash : faEye} />
                  </button>
                </div>
                <p id="pwdnote" className={passwordFocus && !validPassword ? "instructions" : "offscreen"}>
                  <FontAwesomeIcon icon={faInfoCircle} /> 8 to 24 characters.<br />
                  Must include uppercase and lowercase letters, a number and a special character.<br />
                  Allowed characters: <span aria-label="exclamation mark">!</span> <span aria-label="at symbol">@</span> <span aria-label="hashtag">#</span> <span aria-label="dollar sign">$</span> <span aria-label="percent">%</span>
                </p>
              </div>

              {/* --- CONFIRM PASSWORD FIELD --- */}
              <div className="input-group">
                <label className="input-label" htmlFor="confirmPassword">
                  Confirm Password:
                  <span className={validMatch && confirmPassword ? "valid" : "hide"}>
                    <FontAwesomeIcon icon={faCheck} />
                  </span>
                  <span className={validMatch || !confirmPassword ? "hide" : "invalid"}>
                    <FontAwesomeIcon icon={faTimes} />
                  </span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  value={confirmPassword}
                  required
                  aria-invalid={validMatch ? "false" : "true"}
                  aria-describedby="confirmnote"
                  onFocus={() => setMatchFocus(true)}
                  onBlur={() => setMatchFocus(false)}
                  className="auth-input"
                />
                <p id="confirmnote" className={matchFocus && !validMatch ? "instructions" : "offscreen"}>
                  <FontAwesomeIcon icon={faInfoCircle} /> Must match the first password input field.
                </p>
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={!validName || !validEmail || !validPassword || !validMatch || isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? "Signing Up..." : "Sign Up"}
              </button>
            </form>

            <p className="toggle-text">
              Already registered?<br />
              <span className="line">
                <Link to="/login" className="toggle-link">Sign In</Link>
              </span>
            </p>
          </section>
        )}
      </div>
    </div>
  );
};

export default Register;