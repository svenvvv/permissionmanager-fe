#!/bin/sh

SRC="./public/logo.svg"
OUT_BASE_NAME="logo"
OUT_DIR="./public"
IM_OPTS="-background none"

convert -resize 192x192 $IM_OPTS "$SRC" "$OUT_DIR"/"$OUT_BASE_NAME"192.png
convert -resize 512x512 $IM_OPTS "$SRC" "$OUT_DIR"/"$OUT_BASE_NAME"512.png

# Generate multires favicon
convert "$SRC" \
	\( -clone 0 -resize 16x16 \) \
	\( -clone 0 -resize 32x32 \) \
	\( -clone 0 -resize 48x48 \) \
	-delete 0 -colors 64 "$OUT_DIR"/favicon.ico
