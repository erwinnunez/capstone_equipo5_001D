from pydantic import BaseModel

class EmailSettings(BaseModel):
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_PORT: int = 587
    MAIL_USERNAME: str = "sirbennywea@gmail.com" 
    MAIL_PASSWORD: str = "yunj pykj iyff yxbq"
    MAIL_FROM: str = "sirbennywea@gmail.com"
    MAIL_FROM_NAME: str = "Sistema APT"
    MAIL_TLS: bool = True
    MAIL_SSL: bool = False

email_settings = EmailSettings()
