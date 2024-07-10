import { useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { API_URL } from '../config';

export default function Routing() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = Cookies.get('jwtToken');

        const checkNewSetup = async () => {
            try {
                const response = await fetch(`${API_URL}/auth/isNewSetup`, {
                    method: 'GET', 
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch setup status');
                }
                const data = await response.json();
                if (data.newSetup) {
                    navigate("/newSetup");
                } else {
                    navigate("/signIn");
                }
            } catch (error) {
                console.error('Error fetching new setup status:', error);
                navigate("/signIn"); 
            }
        };

        if (token) {
            navigate("/dashboard");
        } else {
            checkNewSetup();
        }
    }, [navigate]);

    return (<></>); 
}
