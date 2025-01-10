import axios from "axios";


export const BaseAxios = axios.create({
  timeout: 7500,
  baseURL: `https://delivery.emnetix.net`
})