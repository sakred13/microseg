import { useState, useEffect } from "react"
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

export default function Routing() {

    const navigate = useNavigate();
    useEffect(() => {
        const token = Cookies.get('jwtToken');
        if(token) 
            navigate("/dashboard")
        else
            navigate("/signIn")
      }, []); 
    

    return( <></> )
}