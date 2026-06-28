'use client';  // only this file is client side

import { useRouter } from 'next/navigation';
import { Calendar } from 'lucide-react';

interface Props {
  style: string;
  navigate: string;
  text:string;
  icon?:boolean;
}

const Button = ({style,navigate,text,icon}:Props) => {
  const router = useRouter();

  return (
    <button
      className={style}
      onClick={() => router.push(navigate)}
    >
     {text} {icon&&<Calendar size={20} />}
    </button>
  );
};

export default Button;