import { useImageStore } from "@/store/ImageStore";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { List } from "lucide-react";
import { Link } from "react-router-dom";

export default function Image() {
  const images = useImageStore((state) => state.images);
  if (!images || images.length === 0) {
    return <div>No images found</div>;
  }
  return (
    <div className="p-8">
      <h1 className="text-3xl p-2 font-bold mb-4 gap-2 flex items-center">
        <List />
        <span className="text-red-500">Docker</span> Images
      </h1>
      {images.map((image) => (
        <Card key={image.id}>
          <CardHeader className="bg-red-500 text-white font-bold text-2xl">
            {image.repository}:{image.tag}
          </CardHeader>
          <CardBody>
            <p>ID: {image.id}</p>
            <p>Size: {image.size}</p>
            <p>Created At: {image.createdAt}</p>
          </CardBody>
          <CardFooter>
            <Link
              to={`/images/${image.id}`}
              className="text-white text-[15px] font-bold hover:bg-blue-800 w-fit bg-blue-600 p-3 rounded-md"
            >
              Details
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
