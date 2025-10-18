import {useEffect,useState} from 'react'
const KEY='gargantuan_admin_token'
export function useAdminToken(){const[token,setToken]=useState('');useEffect(()=>{const s=localStorage.getItem(KEY);if(s)setToken(s)},[]);useEffect(()=>{localStorage.setItem(KEY,token||'')},[token]);return{token,setToken}}