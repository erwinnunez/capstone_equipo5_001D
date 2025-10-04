const ruta_paciente = "http://127.0.0.1:8000/paciente"

async function handleResponse<T>(response:Response):Promise<T> {
    if(!response.ok){
        const error = await response.json()
        throw new Error(error||"error en la solicitud")
    }

    return await response.json() 
}

export async function getPacientes<T>():Promise<T> {
    const responde = await fetch(ruta_paciente,{
        method:"GET",
        headers:{
            "content-type":"application/json"
        }
    })
    return handleResponse(responde)
}

export async function getPacienteByRut<T>(rut_paciente: number): Promise<T> {
    const response = await fetch(`http://127.0.0.1:8000/paciente/${rut_paciente}`, {
        method: "GET",
        headers: {
            "content-type": "application/json",
        },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error || "error en la solicitud");
    }
    return await response.json();
}