from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    email_alerts: bool
    push_alerts: bool
    sms_alerts: bool
    weekly_newsletter: bool
    system_updates: bool

    class Config:
        from_attributes = True

class SettingsUpdate(BaseModel):
    email_alerts: bool | None = None
    push_alerts: bool | None = None
    sms_alerts: bool | None = None
    weekly_newsletter: bool | None = None
    system_updates: bool | None = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str