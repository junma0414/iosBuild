import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
} 


export const isIframe = window.self !== window.top;

// 时区工具函数
export const getTimezoneOffset = () => {
  // 获取用户时区偏移（分钟）
  return new Date().getTimezoneOffset();
};

export const getLocalDateString = () => {
  // 获取用户本地时间的日期字符串 (YYYY-MM-DD)
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const convertToLocalDate = (storedDateString) => {
  // 将存储的日期字符串转换为用户本地日期
  // 注意：存储的日期已经是用户本地的日期，所以直接返回
  if (!storedDateString) return null;
  
  try {
    // 如果已经是 YYYY-MM-DD 格式，直接返回
    if (/^\d{4}-\d{2}-\d{2}$/.test(storedDateString)) {
      return storedDateString;
    }
    
    // 处理其他格式
    const date = new Date(storedDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error converting stored date to local:', error);
    return storedDateString;
  }
};
