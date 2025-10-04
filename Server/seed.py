# seed.py
from app import app, db
from models import User, Service, Staff, Appointment
from datetime import date, time

def seed_database():
    """Seed the database with initial data"""
    
    print("🗑️ Dropping and recreating all tables...")
    # This will recreate all tables with the current schema
    db.drop_all()
    db.create_all()
    
    print("👥 Creating users...")
    # Create users
    users = [
        # Admin users
        User(
            first_name="Admin",
            last_name="User",
            email="admin@salon.com",
            phone="555-0001",
            role="admin"
        ),
        # Staff users
        User(
            first_name="Emma",
            last_name="Wilson",
            email="emma@salon.com",
            phone="555-0002",
            role="staff"
        ),
        User(
            first_name="James",
            last_name="Brown",
            email="james@salon.com",
            phone="555-0003",
            role="staff"
        ),
        User(
            first_name="Sophia",
            last_name="Lee",
            email="sophia@salon.com",
            phone="555-0004",
            role="staff"
        ),
        # Regular customers
        User(
            first_name="Sarah",
            last_name="Johnson",
            email="sarah@email.com",
            phone="555-1001",
            role="user"
        ),
        User(
            first_name="Mike",
            last_name="Davis",
            email="mike@email.com",
            phone="555-1002",
            role="user"
        ),
        User(
            first_name="Lisa",
            last_name="Garcia",
            email="lisa@email.com",
            phone="555-1003",
            role="user"
        ),
        User(
            first_name="David",
            last_name="Miller",
            email="david@email.com",
            phone="555-1004",
            role="user"
        )
    ]
    
    # Set passwords for all users
    for user in users:
        user.set_password("password123")
    
    db.session.add_all(users)
    db.session.flush()
    
    print("💇 Creating services...")
    # Create services
    services = [
        Service(
            name="Women's Haircut",
            description="Professional haircut and styling for women",
            price=45.00,
            duration=60,
            category="Haircut",
            is_active=True
        ),
        Service(
            name="Men's Haircut",
            description="Professional haircut and styling for men",
            price=30.00,
            duration=30,
            category="Haircut",
            is_active=True
        ),
        Service(
            name="Hair Coloring",
            description="Full hair coloring service with premium products",
            price=85.00,
            duration=120,
            category="Color",
            is_active=True
        ),
        Service(
            name="Highlights",
            description="Partial or full highlights with foiling technique",
            price=75.00,
            duration=90,
            category="Color",
            is_active=True
        ),
        Service(
            name="Blowout & Style",
            description="Hair wash, blow dry, and professional styling",
            price=40.00,
            duration=45,
            category="Styling",
            is_active=True
        ),
        Service(
            name="Keratin Treatment",
            description="Smoothing keratin treatment for frizzy hair",
            price=150.00,
            duration=180,
            category="Treatment",
            is_active=True
        ),
        Service(
            name="Manicure",
            description="Classic manicure with shaping and polish",
            price=25.00,
            duration=45,
            category="Nails",
            is_active=True
        ),
        Service(
            name="Pedicure",
            description="Relaxing pedicure with foot massage",
            price=35.00,
            duration=60,
            category="Nails",
            is_active=True
        ),
        Service(
            name="Hair Treatment",
            description="Deep conditioning hair treatment",
            price=35.00,
            duration=30,
            category="Treatment",
            is_active=True
        )
    ]
    
    db.session.add_all(services)
    db.session.flush()
    
    print("👨‍💼 Creating staff members...")
    # Create staff members
    staff_members = [
        Staff(
            first_name="Emma",
            last_name="Wilson",
            email="emma@salon.com",
            phone="555-0002",
            specialty="Senior Stylist",
            bio="With over 10 years of experience, Emma specializes in color correction and precision cutting.",
            experience=10,
            is_active=True
        ),
        Staff(
            first_name="James",
            last_name="Brown",
            email="james@salon.com",
            phone="555-0003",
            specialty="Master Barber",
            bio="James is our expert in men's grooming and classic barbering techniques.",
            experience=8,
            is_active=True
        ),
        Staff(
            first_name="Sophia",
            last_name="Lee",
            email="sophia@salon.com",
            phone="555-0004",
            specialty="Color Specialist",
            bio="Sophia is passionate about creative coloring and balayage techniques.",
            experience=6,
            is_active=True
        )
    ]
    
    db.session.add_all(staff_members)
    db.session.flush()
    
    print("📅 Creating appointments...")
    # Create appointments
    appointments = [
        Appointment(
            user_id=users[4].id,
            service_id=services[0].id,
            staff_id=staff_members[0].id,
            date=date(2024, 1, 15),
            time="10:00",
            price=45.00,
            status="completed",
            notes="Regular trim and style"
        ),
        Appointment(
            user_id=users[5].id,
            service_id=services[1].id,
            staff_id=staff_members[1].id,
            date=date(2024, 1, 16),
            time="14:30",
            price=30.00,
            status="completed",
            notes="Fade cut preferred"
        ),
        Appointment(
            user_id=users[4].id,
            service_id=services[2].id,
            staff_id=staff_members[2].id,
            date=date(2024, 1, 20),
            time="11:00",
            price=85.00,
            status="completed",
            notes="Full color - dark brown"
        ),
        Appointment(
            user_id=users[6].id,
            service_id=services[0].id,
            staff_id=staff_members[0].id,
            date=date(2024, 2, 1),
            time="09:00",
            price=45.00,
            status="scheduled",
            notes="First time client"
        ),
        Appointment(
            user_id=users[5].id,
            service_id=services[1].id,
            staff_id=staff_members[1].id,
            date=date(2024, 2, 2),
            time="15:00",
            price=30.00,
            status="scheduled",
            notes="Regular maintenance"
        )
    ]
    
    db.session.add_all(appointments)
    
    print("💾 Committing changes to database...")
    db.session.commit()
    
    print("✅ Database seeded successfully!")
    print(f"   👥 Users: {len(users)}")
    print(f"   💇 Services: {len(services)}")
    print(f"   👨‍💼 Staff Members: {len(staff_members)}")
    print(f"   📅 Appointments: {len(appointments)}")
    print("\n🔐 Test Login Credentials:")
    print("   Admin: admin@salon.com / password123")
    print("   Staff: emma@salon.com / password123")
    print("   Customer: sarah@email.com / password123")

if __name__ == "__main__":
    with app.app_context():
        seed_database()