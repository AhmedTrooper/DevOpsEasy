import { Card, CardHeader, CardBody, CardFooter, Button } from "@heroui/react";
import { Command } from "@tauri-apps/plugin-shell";
import { Box } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [images, setImages] = useState<any>([]);

  const fetchImages = async () => {
    const cmd = Command.create("docker", [
      "images",
      "--format",
      "{{.ID}}|{{.Repository}}|{{.Tag}}",
    ]);

    const output = await cmd.execute();
    const lines = (output.stdout || "").trim().split("\n");

    const images = lines.map((line) => {
      const [id, name, tag] = line.split("|");
      return { id, name, tag };
    });

    console.log(images);
    setImages(images);
  };

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

      <Button onPress={fetchImages}>Fetch Images</Button>
    </div>
  );
}
