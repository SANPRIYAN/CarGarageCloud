import { getShortLivedDropboxToken } from '../dropbox/dropboxAuth';
import { uploadFileToDropbox, getSharedLink, deleteFileFromDropbox } from '../dropbox/dropboxUpload';
import { carService } from '../mongodb/carService';

/**
 * Converts a car name (make + model) into a safe Dropbox path segment.
 * Replaces spaces/special chars with underscores, trims, lowercases.
 * e.g. "Porsche 911 GT3" → "porsche_911_gt3"
 */
function toSafeName(str) {
  return (str || 'unknown')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_+|_+$/g, ''); // strip leading/trailing underscores
}

/**
 * Uploads a car image to Dropbox using the car's name as both the folder
 * name and the image filename (with the original extension preserved).
 *
 * Dropbox path structure:
 *   /car-garage/<safeCarName>/<safeCarName>.<ext>
 *
 * The `autorename: true` Dropbox option handles duplicate names safely.
 */
export async function uploadCarImage({ carId, garageId, ownerName, file, make, model }) {
  try {
    const accessToken = await getShortLivedDropboxToken();

    // Build a safe name from the car's make + model
    const carName = toSafeName(`${make || ''} ${model || ''}`) || `car_${carId}`;

    // Preserve the original file extension
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';

    // Dropbox path: /car-garage/<carName>/<carName>.<ext>
    const path = `/car-garage/${carName}/${carName}.${ext}`;

    await uploadFileToDropbox(accessToken, path, file);
    const sharedUrl = await getSharedLink(accessToken, path);

    // Save the Dropbox path + shareable URL back to the car document
    const updateResult = await carService.update(carId, {
      imagePath: path,
      imageUrl: sharedUrl,
      updatedAt: new Date().toISOString(),
    });

    if (!updateResult.success) {
      return { success: false, error: updateResult.error };
    }

    return { success: true, data: { path, sharedUrl } };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteCarAndImage(car) {
  try {
    const carId = car.id || car._id;

    // Step 1: Delete the image directly from Dropbox Drive
    if (car.imagePath) {
      try {
        const accessToken = await getShortLivedDropboxToken();
        const formattedPath = car.imagePath.startsWith('/') ? car.imagePath : `/${car.imagePath}`;
        await deleteFileFromDropbox(accessToken, formattedPath);
        console.log(`✅ Deleted image from Dropbox: ${formattedPath}`);
      } catch (dropboxError) {
        console.warn('Dropbox image deletion notice:', dropboxError.message);
      }
    }

    // Step 2: Delete the car record from MongoDB
    const deleteResult = await carService.remove(carId);
    if (!deleteResult.success) {
      return { success: false, error: deleteResult.error };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
