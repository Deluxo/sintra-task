"use client";

import { ChangeEvent, ComponentProps } from "react";
import { Row, Stack } from "../../components/atom/layout";
import { Textarea } from "../../components/atom/form";
import { FormControlRow } from "../../components/atom/molecule/FormControl";
import { useProduct } from "./useProduct";

export function ProductForm(props: ComponentProps<"div">) {
  const { product, setProduct } = useProduct();

  return (
    <Stack {...props}>
      <Row className="space-x-2">
        <FormControlRow className="grow" label="Product Name" inputProps={{
          onChange: (e: ChangeEvent<HTMLInputElement>) => setProduct({ ...product, name: e.target.value }),
          value: product.name,
          placeholder: "EcoBottle Pro",
        }} />

        <FormControlRow label="Category (optional)" inputProps={{
          onChange: (e: ChangeEvent<HTMLInputElement>) => setProduct({ ...product, category: e.target.value }),
          value: product.category || "",
          placeholder: "Health & Wellness",
        }} />

        <FormControlRow label="Price" inputProps={{
          onChange: (e: ChangeEvent<HTMLInputElement>) => setProduct({ ...product, price: parseFloat(e.target.value) || 0 }),
          type: "number",
          value: product.price,
          placeholder: "49.99",
        }} />

      </Row>

      <FormControlRow label="Description" InputComponent={Textarea} inputProps={{
        onChange: (e: ChangeEvent<HTMLTextAreaElement>) => setProduct({ ...product, description: e.target.value }),
        value: product.description,
        placeholder: "Revolutionary reusable water bottle with built-in UV purification...",
        rows: 4,
      }} />

    </Stack>
  );
}
