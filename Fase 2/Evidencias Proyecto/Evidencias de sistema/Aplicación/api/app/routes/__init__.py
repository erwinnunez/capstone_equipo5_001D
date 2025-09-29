from .region import router as region_router
from .comuna import router as comuna_router
from .cesfam import router as cesfam_router

ALL_ROUTERS = [region_router, comuna_router, cesfam_router]
