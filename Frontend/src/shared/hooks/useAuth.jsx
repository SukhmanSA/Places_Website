import React, { useCallback, useEffect, useState } from 'react'

let logoutTimer;

export default function useAuth() {

    const [token, setToken] = useState(null);
    const [uid, setUid] = useState(null);
    const [tokenExpDate,setTokenExpDate] = useState()
  
    const login = useCallback((uid, token, expirationDate) => {
      setToken(token);
      const tokenExpirationDate = expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);
      setTokenExpDate(tokenExpirationDate)
      localStorage.setItem(
        "userData",
        JSON.stringify({
          userId: uid,
          token: token,
          expiration: tokenExpirationDate.toISOString(),
        })
      );
      setUid(uid);
    }, []);
  
    const logout = useCallback(() => {
      setToken(null);
      setUid(null);
      setTokenExpDate(null)
      localStorage.removeItem("userData");
    }, []);
  
    useEffect(()=>{
      if(token && tokenExpDate){
        const remainingTime =  tokenExpDate.getTime() - new Date().getTime()
        logoutTimer = setTimeout(logout, remainingTime)
      }else{
        clearTimeout(logoutTimer)
      }
    },[token,logout,tokenExpDate])
  
    useEffect(() => {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (
        userData &&
        userData.token &&
        new Date(userData.expiration) > new Date()
      ) {
        login(userData.userId, userData.token, new Date(userData.expiration));
      }
    }, [login]);
  
    return { login, logout, token, uid }

}
