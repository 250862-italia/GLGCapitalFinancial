from locust import HttpUser, task, between
import random
import string

class WebsiteUser(HttpUser):
    wait_time = between(1, 3)

    def random_email(self):
        return f"user{random.randint(10000,99999)}@example.com"

    def random_phone(self):
        return f"+39{random.randint(1000000000,9999999999)}"

    def random_amount(self):
        return random.choice([500, 1000, 5000])

    @task(5)
    def register(self):
        self.email = self.random_email()
        self.password = "Test1234!"
        self.client.post("/api/test-register", json={
            "first_name": "LoadTest",
            "last_name": "User",
            "email": self.email,
            "phone": self.random_phone(),
            "password": self.password
        })

    @task(3)
    def upload_kyc(self):
        # 50% of users upload KYC
        if hasattr(self, 'email'):
            # Simulate KYC upload (mocked, as file upload via Locust is limited)
            self.client.post("/api/kyc/upload-document", data={
                "userId": self.email,
                "documentType": "ID_DOCUMENT"
            })

    @task(2)
    def invest(self):
        # 30% of users make an investment
        if hasattr(self, 'email'):
            self.client.post("/api/investments", json={
                "client_id": self.email,
                "package_id": "REPLACE_WITH_PACKAGE_ID",
                "amount": self.random_amount(),
                "currency": "EUR",
                "start_date": "2024-07-01",
                "end_date": "2025-07-01",
                "status": "pending",
                "total_returns": 0,
                "daily_returns": 0,
                "payment_method": random.choice(["credit_card", "bank_transfer"]),
                "notes": "Load test investment"
            })

    @task(1)
    def cancel(self):
        # 20% of users cancel before investing
        pass 