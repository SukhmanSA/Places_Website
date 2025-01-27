import { useEffect } from "react";
import "./UserItem.css"

export default function GoogleAuth({ history, login }) {
    useEffect(() => {
        google.accounts.id.initialize({
          client_id: "991101622384-m25j9ak9vqj09l73p3e1lr3ulk9be73q.apps.googleusercontent.com",
          callback: (response) => {
            console.log("Response:", response);
            const idToken = response.credential;
      

            fetch("http://localhost:5000/api/users/google-login", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ idToken }),
              })
              .then((response) => response.json())
                .then((data) => {
                  console.log("Login successful:", data);
                  console.log("object with image image",data)
                  login(data.userId, data.token);
                  history.push("/");
                })
                .catch((err) => console.error(err));
              
          },
        });
      
        google.accounts.id.renderButton(
          document.getElementById("google-signin-button"),
          { theme: "outline", size: "large" }
        );
      }, [login, history]);
      
  
    return <div id="google-signin-button"></div>;
  }