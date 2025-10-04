import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        reload=True,
        # host=settings.SERVER_HOST,
        # port=settings.SERVER_PORT,
        # reload=settings.ENV in ["test", "dev"],
        # log_level="debug" if settings.ENV in ["test", "dev"] else None,
    )