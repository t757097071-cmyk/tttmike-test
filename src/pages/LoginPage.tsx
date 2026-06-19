import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loginWithSmsCode, sendSmsCode } from "../api/commercial";
import type { ApiUser } from "../api/commercial";

interface LoginPageProps {
  onLoginSuccess: (user: ApiUser) => Promise<void>;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const redirectTo = searchParams.get("redirect") || "/profile";

  const handleSendCode = async () => {
    setIsSending(true);
    setMessage("");
    try {
      const result = await sendSmsCode(phone);
      setMessage(result.devCode ? `验证码已发送，开发环境验证码：${result.devCode}` : result.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "验证码发送失败");
    } finally {
      setIsSending(false);
    }
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoggingIn(true);
    setMessage("");
    try {
      const result = await loginWithSmsCode(phone, code);
      await onLoginSuccess(result.user);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "登录失败");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <section className="page-shell login-page">
      <div className="page-hero section-card">
        <span className="section-kicker">账户登录</span>
        <h1>手机号登录</h1>
        <p>登录后，愿力余额、测试额度记录和体验功能都会保存到服务端账户。</p>
      </div>

      <form className="auth-panel section-card" onSubmit={handleLogin}>
        <label>
          手机号
          <input
            inputMode="numeric"
            maxLength={11}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="请输入 11 位手机号"
          />
        </label>
        <label>
          验证码
          <div className="sms-row">
            <input
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="6 位验证码"
            />
            <button type="button" onClick={handleSendCode} disabled={isSending}>
              {isSending ? "发送中" : "获取验证码"}
            </button>
          </div>
        </label>
        <button type="submit" disabled={isLoggingIn}>
          {isLoggingIn ? "登录中..." : "登录"}
        </button>
        {message && <p className="form-message">{message}</p>}
        <small className="compliance-note compact">
          手机号仅用于账户登录、订单查询和必要服务通知。正式上线请接入短信服务商并配置隐私政策。
        </small>
      </form>
    </section>
  );
}
