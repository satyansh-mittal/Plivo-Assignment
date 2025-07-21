from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity, get_jwt
from flask_socketio import SocketIO, emit, join_room, leave_room
from config import Config
from models import db, User, Organization, Service, Incident, IncidentUpdate, StatusChange
from datetime import datetime, timedelta
import re

app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
CORS(app, origins=["http://localhost:5173", "http://localhost:5174"])
socketio = SocketIO(app, cors_allowed_origins=["http://localhost:5173", "http://localhost:5174"])

# Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['email', 'password', 'name', 'organization_name']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'User already exists'}), 400
    
    # Create organization slug
    org_slug = re.sub(r'[^a-zA-Z0-9-]', '-', data['organization_name'].lower())
    if Organization.query.filter_by(slug=org_slug).first():
        org_slug += f"-{datetime.utcnow().timestamp()}"
    
    # Create organization
    organization = Organization(
        name=data['organization_name'],
        slug=org_slug
    )
    db.session.add(organization)
    db.session.flush()  # Get the ID
    
    # Create user
    user = User(
        email=data['email'],
        name=data['name'],
        role='admin',  # First user is admin
        organization_id=organization.id
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    # Create access token
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        'access_token': access_token,
        'user': user.to_dict(),
        'organization': organization.to_dict()
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if user and user.check_password(data['password']) and user.is_active:
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict(),
            'organization': user.organization.to_dict()
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'user': user.to_dict(),
        'organization': user.organization.to_dict()
    })

# Service Routes
@app.route('/api/services', methods=['GET'])
@jwt_required()
def get_services():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    services = Service.query.filter_by(organization_id=user.organization_id).all()
    return jsonify([service.to_dict() for service in services])

@app.route('/api/services', methods=['POST'])
@jwt_required()
def create_service():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json()
    
    if not data or 'name' not in data:
        return jsonify({'error': 'Name is required'}), 400
    
    service = Service(
        name=data['name'],
        description=data.get('description', ''),
        organization_id=user.organization_id
    )
    db.session.add(service)
    db.session.commit()
    
    # Emit real-time update
    socketio.emit('service_created', service.to_dict(), to=f"org_{user.organization_id}")
    
    return jsonify(service.to_dict()), 201

@app.route('/api/services/<int:service_id>', methods=['PUT'])
@jwt_required()
def update_service_status(service_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    service = Service.query.filter_by(id=service_id, organization_id=user.organization_id).first()
    if not service:
        return jsonify({'error': 'Service not found'}), 404
    
    data = request.get_json()
    old_status = service.status
    new_status = data.get('status', service.status)
    
    # Record status change
    if old_status != new_status:
        status_change = StatusChange(
            service_id=service.id,
            old_status=old_status,
            new_status=new_status,
            changed_by=user_id
        )
        db.session.add(status_change)
    
    service.status = new_status
    service.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    # Emit real-time update
    socketio.emit('service_updated', service.to_dict(), to=f"org_{user.organization_id}")
    socketio.emit('public_status_update', service.to_dict(), to=f"public_{user.organization.slug}")
    
    return jsonify(service.to_dict())

# Incident Routes
@app.route('/api/incidents', methods=['GET'])
@jwt_required()
def get_incidents():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    incidents = Incident.query.filter_by(organization_id=user.organization_id).order_by(Incident.created_at.desc()).all()
    return jsonify([incident.to_dict() for incident in incidents])

@app.route('/api/incidents', methods=['POST'])
@jwt_required()
def create_incident():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json()
    
    required_fields = ['title', 'service_id', 'impact']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    incident = Incident(
        title=data['title'],
        description=data.get('description', ''),
        impact=data['impact'],
        incident_type=data.get('incident_type', 'incident'),
        service_id=data['service_id'],
        organization_id=user.organization_id,
        created_by=user_id
    )
    db.session.add(incident)
    db.session.commit()
    
    # Emit real-time update
    socketio.emit('incident_created', incident.to_dict(), to=f"org_{user.organization_id}")
    socketio.emit('public_incident_update', incident.to_dict(), to=f"public_{user.organization.slug}")
    
    return jsonify(incident.to_dict()), 201

@app.route('/api/incidents/<int:incident_id>/updates', methods=['POST'])
@jwt_required()
def add_incident_update(incident_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json()
    
    incident = Incident.query.filter_by(id=incident_id, organization_id=user.organization_id).first()
    if not incident:
        return jsonify({'error': 'Incident not found'}), 404
    
    if not data.get('message'):
        return jsonify({'error': 'Message is required'}), 400
    
    update = IncidentUpdate(
        message=data['message'],
        status=data.get('status', incident.status),
        incident_id=incident_id,
        created_by=user_id
    )
    
    # Update incident status if provided
    if data.get('status'):
        incident.status = data['status']
        if data['status'] == 'resolved':
            incident.resolved_at = datetime.utcnow()
    
    db.session.add(update)
    db.session.commit()
    
    # Emit real-time update
    socketio.emit('incident_updated', incident.to_dict(), to=f"org_{user.organization_id}")
    socketio.emit('public_incident_update', incident.to_dict(), to=f"public_{user.organization.slug}")
    
    return jsonify(update.to_dict()), 201

# Public Routes (No auth required)
@app.route('/api/public/<org_slug>/status', methods=['GET'])
def get_public_status(org_slug):
    organization = Organization.query.filter_by(slug=org_slug).first()
    if not organization:
        return jsonify({'error': 'Organization not found'}), 404
    
    services = Service.query.filter_by(organization_id=organization.id).all()
    active_incidents = Incident.query.filter_by(
        organization_id=organization.id
    ).filter(
        Incident.status.in_(['investigating', 'identified', 'monitoring'])
    ).order_by(Incident.created_at.desc()).all()
    
    recent_incidents = Incident.query.filter_by(
        organization_id=organization.id
    ).order_by(Incident.created_at.desc()).limit(10).all()
    
    return jsonify({
        'organization': organization.to_dict(),
        'services': [service.to_dict() for service in services],
        'active_incidents': [incident.to_dict() for incident in active_incidents],
        'recent_incidents': [incident.to_dict() for incident in recent_incidents]
    })

@app.route('/api/public/<org_slug>/timeline', methods=['GET'])
def get_public_timeline(org_slug):
    organization = Organization.query.filter_by(slug=org_slug).first()
    if not organization:
        return jsonify({'error': 'Organization not found'}), 404
    
    # Get recent status changes and incidents
    status_changes = StatusChange.query.join(Service).filter(
        Service.organization_id == organization.id
    ).order_by(StatusChange.created_at.desc()).limit(20).all()
    
    incidents = Incident.query.filter_by(
        organization_id=organization.id
    ).order_by(Incident.created_at.desc()).limit(10).all()
    
    return jsonify({
        'status_changes': [change.to_dict() for change in status_changes],
        'incidents': [incident.to_dict() for incident in incidents]
    })

# WebSocket Events
@socketio.on('connect')
def on_connect(auth):
    print('Client connected')

@socketio.on('disconnect')
def on_disconnect():
    print('Client disconnected')

@socketio.on('join_organization')
def on_join_organization(data):
    room = f"org_{data['organization_id']}"
    join_room(room)
    emit('joined', {'room': room})

@socketio.on('join_public')
def on_join_public(data):
    room = f"public_{data['org_slug']}"
    join_room(room)
    emit('joined', {'room': room})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
