from PIL import Image

# Set the background color (RGB format)
background_color = (31, 31, 31)  # For example, white background

# List of image file paths to combine vertically
image_paths = ["image1.png", "image2.png", "image3.png", "image4.png"]

# Open the images and get their dimensions
images = [Image.open(image_path) for image_path in image_paths]
width, total_height = images[3].size[0], sum(image.size[1] for image in images)

# Create a new blank image with the specified background color
combined_image = Image.new("RGB", (width, total_height), background_color)

# Paste the images one below the other
y_offset = 0
for image in images:
    combined_image.paste(image, (0, y_offset))
    y_offset += image.size[1]

# Save the combined image
combined_image.save("combined_image.png")

# Optional: Display the combined image
combined_image.show()
