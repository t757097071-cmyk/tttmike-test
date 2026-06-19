import { NavLink } from "react-router-dom";

export function MobileBottomNav() {
  return (
    <nav className="mobile-bottom-nav" aria-label="移动端底部导航">
      <NavLink to="/">首页</NavLink>
      <NavLink to="/blessing">祈福</NavLink>
      <NavLink to="/lamps">心愿灯</NavLink>
      <NavLink to="/draw">抽签</NavLink>
      <NavLink to="/huangli">黄历</NavLink>
      <NavLink to="/jingxin">静心</NavLink>
      <NavLink to="/dream">解梦</NavLink>
      <NavLink to="/profile">我的</NavLink>
    </nav>
  );
}
