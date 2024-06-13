from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session

app = FastAPI()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/create_configuration/", response_model=Configuration)
def create_configuration(configuration: ConfigurationCreate, db: Session = Depends(get_db)):
    db_config = Configuration(**configuration.dict())
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config

@app.get("/get_configuration/{country_code}", response_model=Configuration)
def get_configuration(country_code: str, db: Session = Depends(get_db)):
    db_config = db.query(Configuration).filter(Configuration.country_code == country_code).first()
    if db_config is None:
        raise HTTPException(status_code=404, detail="Configuration not found")
    return db_config
    
@app.post("/update_configuration/", response_model=Configuration)\
def update_configuration(configuration: Configuration, db: Session = Depends(get_db)):
    db_config = db.query(Configuration).filter(Configuration.id == configuration.id).first()
    if not db_config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    for var, value in vars(configuration).items():
        setattr(db_config, var, value) if value else None
    db.commit()
    return db_config
    
@app.delete("/delete_configuration/", response_model=Configuration)
def delete_configuration(country_code: str, db: Session = Depends(get_db)):
    db_config = db.query(Configuration).filter(Configuration.country_code == country_code).first()
    if not db_config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    db.delete(db_config)
    db.commit()
    return db_config