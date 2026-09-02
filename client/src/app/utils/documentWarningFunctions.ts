export const checkIfPermitIsNear = (date: string | null | undefined) => {
    if(date == null || date == undefined) return false
    const expirationDate = new Date(date);
    const today = new Date();
  
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
    return diffDays <= 30 && diffDays >= 0;
  };
  
  export const getRemainingDays = (date: string) => {
    const expirationDate = new Date(date);
    const today = new Date();
  
    const diffTime = expirationDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  export const checkIfPermitIsExpired = (date: string | null | undefined) => {
    if(date == null || date == undefined) return false
    const expirationDate = new Date(date);
    const today = new Date();
  
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
    return diffDays < 0; // expired if negative
  };
  
 
  