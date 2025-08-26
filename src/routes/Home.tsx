import { useImageStore } from "@/store/ImageStore";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/react";

import { Box } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
export default function Home() {
  const fetchImages = useImageStore((state) => state.fetchImages);
  const images = useImageStore((state) => state.images);
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  return (
    <div className="p-8">
      <Card>
        <CardHeader className="bg-red-500 text-white font-bold text-2xl">
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Box />
            <span>Image</span>
          </h1>
        </CardHeader>
        {images && (
          <CardBody>
            <h1 className="flex items-center gap-2 text-[18px] font-semibold">
              <Box />
              <span>{images.length} docker images founds</span>
            </h1>
          </CardBody>
        )}
        <CardFooter>
          <Link
            to="/images"
            className="text-white text-[15px] font-bold hover:bg-blue-800 w-fit bg-blue-600 p-3 rounded-md"
          >
            View all images
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
