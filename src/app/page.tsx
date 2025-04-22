
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { estimateNutritionalValue } from "@/ai/flows/estimate-nutritional-value";
import { identifyIngredients } from "@/ai/flows/identify-ingredients";
import { PlusCircle, Edit } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Home() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<{ name: string; confidence: number }[]>([]);
  const [nutritionalValues, setNutritionalValues] = useState<
    { name: string; calories: number; protein: number; fat: number; carbohydrates: number }[]
  >([]);
  const [manualIngredients, setManualIngredients] = useState<{ name: string; quantity: string }[]>([]);
  const [newIngredient, setNewIngredient] = useState({ name: "", quantity: "" });
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setImageSrc(base64String);

        // Call the ingredient recognition API
        try {
          const ingredientsResult = await identifyIngredients({ photoUrl: base64String });
          setIngredients(ingredientsResult.ingredients);
        } catch (error) {
          console.error("Error identifying ingredients:", error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNutritionalAnalysis = async () => {
    // Transform identified ingredients to the required format
    const formattedIngredients = manualIngredients.length > 0
      ? manualIngredients
      : ingredients.map((ingredient) => ({ name: ingredient.name, quantity: "1 serving" }));

    try {
      const nutritionalResult = await estimateNutritionalValue({ ingredients: formattedIngredients });
      setNutritionalValues(nutritionalResult.nutritionalValues);
    } catch (error) {
      console.error("Error estimating nutritional value:", error);
    }
  };

  const handleAddIngredient = () => {
    setManualIngredients([...manualIngredients, newIngredient]);
    setNewIngredient({ name: "", quantity: "" }); // Reset input fields
  };

  const openCameraDialog = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-background">
      <h1 className="text-3xl font-semibold mb-4">NutriSnap</h1>

      <Card className="w-full max-w-md mb-4">
        <CardHeader>
          <CardTitle>Capture Food Photo</CardTitle>
          <CardDescription>Take a photo of your food to identify the ingredients.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {imageSrc ? (
            <img src={imageSrc} alt="Food" className="max-w-full h-auto rounded-md mb-4" />
          ) : (
            <Button variant="outline" onClick={openCameraDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Take Photo
            </Button>
          )}
          <input
            type="file"
            accept="image/*"
            capture="camera"
            className="hidden"
            onChange={handleImageCapture}
            ref={cameraInputRef}
          />
        </CardContent>
      </Card>

      <Card className="w-full max-w-md mb-4">
        <CardHeader>
          <CardTitle>Identified Ingredients</CardTitle>
          <CardDescription>Here are the ingredients identified in your photo.</CardDescription>
        </CardHeader>
        <CardContent>
          {ingredients.length > 0 ? (
            <ScrollArea className="h-[200px] w-full rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingredient</TableHead>
                  <TableHead>Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingredients.map((ingredient, index) => (
                  <TableRow key={index}>
                    <TableCell>{ingredient.name}</TableCell>
                    <TableCell>{(ingredient.confidence * 100).toFixed(2)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </ScrollArea>
          ) : (
            <p>No ingredients identified. Please upload a photo.</p>
          )}
        </CardContent>
      </Card>

      <Card className="w-full max-w-md mb-4">
        <CardHeader>
          <CardTitle>Manual Ingredient Adjustment</CardTitle>
          <CardDescription>Add or modify ingredients and quantities.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 mb-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="ingredient-name">Ingredient Name</Label>
                <Input
                  type="text"
                  id="ingredient-name"
                  value={newIngredient.name}
                  onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="ingredient-quantity">Quantity</Label>
                <Input
                  type="text"
                  id="ingredient-quantity"
                  value={newIngredient.quantity}
                  onChange={(e) => setNewIngredient({ ...newIngredient, quantity: e.target.value })}
                />
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={handleAddIngredient}>
              Add Ingredient
            </Button>
          </div>
          {manualIngredients.length > 0 && (
            <ScrollArea className="h-[200px] w-full rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingredient</TableHead>
                  <TableHead>Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {manualIngredients.map((ingredient, index) => (
                  <TableRow key={index}>
                    <TableCell>{ingredient.name}</TableCell>
                    <TableCell>{ingredient.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Card className="w-full max-w-md mb-4">
        <CardHeader>
          <CardTitle>Nutritional Analysis</CardTitle>
          <CardDescription>Estimated nutritional values for the ingredients.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleNutritionalAnalysis} className="bg-accent text-background hover:bg-accent-foreground">
            Analyze Nutrition
          </Button>
          {nutritionalValues.length > 0 && (
            <ScrollArea className="h-[200px] w-full rounded-md border mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingredient</TableHead>
                  <TableHead>Calories</TableHead>
                  <TableHead>Protein (g)</TableHead>
                  <TableHead>Fat (g)</TableHead>
                  <TableHead>Carbs (g)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nutritionalValues.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.calories.toFixed(2)}</TableCell>
                    <TableCell>{item.protein.toFixed(2)}</TableCell>
                    <TableCell>{item.fat.toFixed(2)}</TableCell>
                    <TableCell>{item.carbohydrates.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
