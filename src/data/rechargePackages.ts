import type { RechargePackage } from "../types";

export const rechargePackages: RechargePackage[] = [
  {
    id: "first-wish",
    packageName: "初愿包",
    price: 9.9,
    wishPower: 99,
    description: "适合首次点亮心愿灯",
    highlightText: "可点亮学业顺遂灯后剩余 11 愿力",
  },
  {
    id: "small-blessing",
    packageName: "小福包",
    price: 19.9,
    wishPower: 219,
    description: "适合日常祈愿与木鱼修心",
  },
  {
    id: "advance-wish",
    packageName: "进愿包",
    price: 39.9,
    wishPower: 469,
    description: "适合连续祈愿一周",
    badge: "常用",
  },
  {
    id: "jinyuan",
    packageName: "锦愿包",
    price: 68,
    wishPower: 899,
    description: "适合长期祈愿与心愿灯墙",
    badge: "推荐",
    highlightText: "推荐档，适合多次点灯",
  },
  {
    id: "long-light",
    packageName: "长明包",
    price: 99,
    wishPower: 1399,
    description: "适合多次点灯与长期保存记录",
    badge: "高性价比",
    highlightText: "愿力更充裕，适合长期使用",
  },
  {
    id: "complete",
    packageName: "圆满包",
    price: 199,
    wishPower: 2999,
    description: "适合长期祈愿、完整签文与长明灯",
    badge: "尊享",
  },
];
