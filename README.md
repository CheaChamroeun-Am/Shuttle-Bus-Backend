# SBS Backend-V3

## Requirements

You should have:

- docker: any

## Getting started - Development

Create .env file and copy this in

```
DATABASE_URL="postgresql://sbs:123@db:5438/sbs_db?schema=public"
PORT=5000
ACCESS_TOKEN_SECRET="sbs-backned-team_123456789!@#$%^&*()"
REFRESH_TOKEN_SECRET="()*&^%$#@!987654321_sbs-backend-team"
MAILUSERNAME=
MAILPASSWORD=
BASE_URL=http://localhost:5000
```

Or you can look it up in sample.env

# NOTE

- Before run docker compose, please make sure that you have .env file in root folder
- Make sure in .env you have <strong style='color:red'>MAILUSERNAME, MAILPASSWORD</strong> that are provide by backend team

To get start we need to run docker compose on the root folder.

Copy command below then run it in terminal of your project

```
docker-compose up -d
```

After that we need to run docker comopose success, you can access backend using this url

```
http://localhost:5000
```

## Credentail

Please look at credentail.txt file
