from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base

class AITone(str, enum.Enum):
    SERIEUX = "Sérieux"
    AMICAL = "Amical"
    COMMERCIAL = "Commercial"

class UserRole(str, enum.Enum):
    ADMIN = "Admin"
    AGENT = "Agent"

class LeadStatus(str, enum.Enum):
    CHAUD = "Chaud"
    FROID = "Froid"

class Agency(Base):
    __tablename__ = "agencies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    ai_tone = Column(String, default=AITone.SERIEUX)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    users = relationship("User", back_populates="agency")
    leads = relationship("Lead", back_populates="agency")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    agency_id = Column(Integer, ForeignKey("agencies.id"))
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default=UserRole.AGENT)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    agency = relationship("Agency", back_populates="users")

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    agency_id = Column(Integer, ForeignKey("agencies.id"))
    name = Column(String, nullable=False)
    phone = Column(String)
    budget = Column(String)
    sector = Column(String)
    status = Column(String, default=LeadStatus.FROID)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    agency = relationship("Agency", back_populates="leads")
