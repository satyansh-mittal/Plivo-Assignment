from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import bcrypt
from sqlalchemy import inspect

db = SQLAlchemy()

class Organization(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    slug = db.Column(db.String(64), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    users = db.relationship('User', backref='organization', lazy=True)
    services = db.relationship('Service', backref='organization', lazy=True)
    incidents = db.relationship('Incident', backref='organization', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'created_at': self.created_at.isoformat()
        }

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), default='member')  # admin, member
    organization_id = db.Column(db.Integer, db.ForeignKey('organization.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'organization_id': self.organization_id,
            'created_at': self.created_at.isoformat()
        }

class Service(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(32), nullable=False, default='operational')  # operational, degraded, partial_outage, major_outage
    organization_id = db.Column(db.Integer, db.ForeignKey('organization.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    incidents = db.relationship('Incident', backref='service', lazy=True)
    status_changes = db.relationship('StatusChange', backref='service', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'status': self.status,
            'organization_id': self.organization_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Incident(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(32), nullable=False, default='investigating')  # investigating, identified, monitoring, resolved
    impact = db.Column(db.String(32), nullable=False)  # minor, major, critical
    incident_type = db.Column(db.String(32), nullable=False, default='incident')  # incident, maintenance
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=False)
    organization_id = db.Column(db.Integer, db.ForeignKey('organization.id'), nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    resolved_at = db.Column(db.DateTime)
    
    # Relationships
    updates = db.relationship('IncidentUpdate', backref='incident', lazy=True, order_by='IncidentUpdate.created_at.desc()')
    
    def to_dict(self, include_updates=True):
        result = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'impact': self.impact,
            'incident_type': self.incident_type,
            'service_id': self.service_id,
            'organization_id': self.organization_id,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None
        }
        
        # Only include updates if requested and safely accessible
        if include_updates:
            try:
                # Use SQLAlchemy inspection to check if relationship is loaded
                state = inspect(self)
                if 'updates' in state.attrs and state.attrs.updates.loaded_value is not None:
                    result['updates'] = [update.to_dict() for update in state.attrs.updates.loaded_value]
                else:
                    result['updates'] = []
            except Exception:
                # If updates aren't loaded or accessible, leave as empty list
                result['updates'] = []
        
        return result

class IncidentUpdate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(32), nullable=False)
    incident_id = db.Column(db.Integer, db.ForeignKey('incident.id'), nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'message': self.message,
            'status': self.status,
            'incident_id': self.incident_id,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat()
        }

class StatusChange(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=False)
    old_status = db.Column(db.String(32))
    new_status = db.Column(db.String(32), nullable=False)
    changed_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'service_id': self.service_id,
            'old_status': self.old_status,
            'new_status': self.new_status,
            'changed_by': self.changed_by,
            'created_at': self.created_at.isoformat()
        }
