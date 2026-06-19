import { NavLink } from "react-router-dom";
import GlassSurface from "./GlassSurface";
import logo from "../assets/jinyuan-logo.png";

const navItems = [
  { label: "首页", to: "/" },
  { label: "祈福", to: "/blessing" },
  { label: "心愿灯", to: "/lamps" },
  { label: "抽签", to: "/draw" },
  { label: "今日黄历", to: "/huangli" },
  { label: "静心阁", to: "/jingxin" },
  { label: "周公解梦", to: "/dream" },
  { label: "领愿力", to: "/recharge" },
  { label: "我的", to: "/profile" },
  { label: "登录", to: "/login" },
] as const;

export function Header() {
  return (
    <header className="site-header">
      <GlassSurface
        width="100%"
        height="100%"
        borderRadius={999}
        borderWidth={0.12}
        brightness={72}
        opacity={0.78}
        blur={9}
        displace={0.35}
        backgroundOpacity={0.22}
        saturation={1.85}
        distortionScale={-92}
        redOffset={6}
        greenOffset={14}
        blueOffset={22}
        mixBlendMode="screen"
        className="site-header-surface"
      >
        <div className="site-header-inner">
          <NavLink className="brand" to="/">
            <img src={logo} alt="锦愿阁 logo" />
            <span>锦愿阁</span>
          </NavLink>
          <nav className="nav" aria-label="主导航">
            {navItems.map((item) => (
              <NavLink key={item.label} to={item.to}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </GlassSurface>
    </header>
  );
}
