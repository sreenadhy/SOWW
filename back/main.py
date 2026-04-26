import os
from typing import List
from uuid import uuid4

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


PRODUCT_CATALOG = {
    1: {"name": "Cold Pressed Groundnut Oil", "price": 600.0},
    2: {"name": "Virgin Coconut Oil", "price": 400.0},
    3: {"name": "Wood Pressed Sesame Oil", "price": 500.0},
}


class OrderItem(BaseModel):
    id: int = Field(...)
    qty: int = Field(...)


class ValidateOrderRequest(BaseModel):
    items: List[OrderItem]
    amount: float = Field(...)


class ValidateOrderResponse(BaseModel):
    valid: bool
    message: str
    validated_amount: float
    order_id: str


app = FastAPI(title="Srtha Oils API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/validate-order", response_model=ValidateOrderResponse)
def validate_order(payload: ValidateOrderRequest) -> ValidateOrderResponse:
    order_id = str(uuid4())

    if payload.amount <= 0:
        return ValidateOrderResponse(
            valid=False,
            message="Amount must be greater than zero.",
            validated_amount=0,
            order_id=order_id,
        )

    if not payload.items:
        return ValidateOrderResponse(
            valid=False,
            message="At least one item is required.",
            validated_amount=0,
            order_id=order_id,
        )

    validated_amount = 0.0

    for item in payload.items:
        if item.id <= 0 or item.qty <= 0:
            return ValidateOrderResponse(
                valid=False,
                message="Item id and quantity must be greater than zero.",
                validated_amount=0,
                order_id=order_id,
            )

        product = PRODUCT_CATALOG.get(item.id)
        if product is None:
            return ValidateOrderResponse(
                valid=False,
                message=f"Product with id {item.id} is not available.",
                validated_amount=0,
                order_id=order_id,
            )
        validated_amount += product["price"] * item.qty

    validated_amount = round(validated_amount, 2)
    requested_amount = round(payload.amount, 2)

    if requested_amount != validated_amount:
        return ValidateOrderResponse(
            valid=False,
            message="Submitted amount does not match the validated total.",
            validated_amount=validated_amount,
            order_id=order_id,
        )

    return ValidateOrderResponse(
        valid=True,
        message="Order validated successfully.",
        validated_amount=validated_amount,
        order_id=order_id,
    )


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=False,
    )
