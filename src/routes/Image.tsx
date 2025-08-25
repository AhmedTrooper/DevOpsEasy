import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Link } from "react-router-dom";

export default function Image() {
    return (
        <div className="p-8">
            <Card>
                <CardHeader className="bg-red-500 text-white font-bold text-2xl">Image Details</CardHeader>
                <CardBody>
                    <h1>Image Name: Sample Image</h1>
                    <p>Image Size: 2MB</p>
                </CardBody>
                <CardFooter>
                    <Link to="/images" className="text-blue-500 hover:underline">
                        Back to Images
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
