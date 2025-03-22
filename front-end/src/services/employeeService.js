import axios from "axios";
const API_URL = "https://abeliasun-backend-5c08804f47f8.herokuapp.com" 

export const getEmployee = async () => {
    try{
        const response = await axios.get(`${API_URL}/api/employees`);
        return response.data
    } catch(error) {
        console.error("Erreur api", error)
    }
}

export const addEmployee = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/api/employees`, data)
        return response.data
    } catch (error) {
        console.error("Erreur api ajout d'un employé", error)
    }
} 

export const deleteEmployee = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/api/employees/${id}`)
        return response.data
    } catch (error) {
        console.error("Erreur api impossible de supprimer un employé", error)
    }
}

export const updateEmployee = async (id, data) => {
    try {
        const response = await axios.put(`${API_URL}/api/employees/${id}`, data)
        return response.data
    } catch (error) {
        console.error("Impossible de mettre à jour un employé", error)
    }
}
 
