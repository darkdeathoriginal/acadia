'use client'
import { useEffect } from 'react';
import Cookie from 'js-cookie';

export default function Redirect() {
  const token = Cookie.get('token') || '';

  useEffect(() => {
    console.log(window.location.href);
    if (!token && window.location.href.split('/').at(-1) !== 'login') {
        window.location.href = "/login";
    }
  }, [token]);

  return null;
}
