export const portraitUrl = (id:string, explicit?:string) =>
  explicit ?? `/images/editors/${id}/portrait.jpg`;
export const brollUrl    = (id:string, explicit?:string) =>
  explicit ?? `/images/editors/${id}/broll.jpg`;
