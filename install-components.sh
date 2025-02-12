#!/bin/bash

# Create components directory if it doesn't exist
mkdir -p src/components/ui

# Install components using npx shadcn-ui add
components=(
  "button"
  "card"
  "dialog"
  "dropdown-menu"
  "input"
  "textarea"
  "avatar"
  "separator"
)

for component in "${components[@]}"
do
  npx shadcn-ui@latest add "$component" -y
done 