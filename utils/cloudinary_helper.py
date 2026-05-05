import cloudinary.uploader
import cloudinary.api


def upload_image(file, folder='ramsetu/products'):
    """Upload an image to Cloudinary and return URL + public_id."""
    try:
        result = cloudinary.uploader.upload(
            file,
            folder=folder,
            resource_type='image',
            transformation=[
                {'quality': 'auto', 'fetch_format': 'auto'}
            ]
        )
        return {
            'url': result.get('secure_url'),
            'public_id': result.get('public_id'),
        }
    except Exception as e:
        print(f'Cloudinary upload error: {e}')
        return None


def delete_image(public_id):
    """Delete an image from Cloudinary by its public_id."""
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result.get('result') == 'ok'
    except Exception as e:
        print(f'Cloudinary delete error: {e}')
        return False
