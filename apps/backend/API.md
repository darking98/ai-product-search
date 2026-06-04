# API de Productos - Documentación

Esta API proporciona endpoints para gestionar productos y generar embeddings para búsqueda vectorial.

## Base URL

```
http://localhost:3000
```

## Endpoints

### 1. Listar Productos

**GET** `/products`

Lista todos los productos activos.

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Producto ejemplo",
      "description": "Descripción del producto",
      "price": 99.99,
      "stock": 10,
      "category": "Electrónica",
      "brand": "Marca X",
      "image_url": "https://ejemplo.com/imagen.jpg",
      "slug": "producto-ejemplo",
      "active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

### 2. Obtener un Producto

**GET** `/products/:id`

Obtiene un producto específico por ID.

**Ejemplo:**
```bash
curl http://localhost:3000/products/1
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Producto ejemplo",
    "description": "Descripción del producto",
    "price": 99.99,
    "stock": 10,
    "category": "Electrónica"
  }
}
```

### 3. Crear Producto

**POST** `/products`

Crea un nuevo producto.

**Body:**
```json
{
  "name": "Laptop Gaming",
  "description": "Laptop de alto rendimiento para gaming",
  "price": 1299.99,
  "stock": 5,
  "category": "Computadoras",
  "brand": "ASUS",
  "image_url": "https://ejemplo.com/laptop.jpg",
  "slug": "laptop-gaming-asus",
  "keywords": ["laptop", "gaming", "asus", "computadora"]
}
```

**Ejemplo con curl:**
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop Gaming",
    "description": "Laptop de alto rendimiento para gaming",
    "price": 1299.99,
    "stock": 5,
    "category": "Computadoras",
    "brand": "ASUS",
    "image_url": "https://ejemplo.com/laptop.jpg"
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Laptop Gaming",
    "price": 1299.99,
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "Producto creado exitosamente"
}
```

### 4. Actualizar Producto

**PATCH** `/products/:id`

Actualiza un producto existente.

**Body (todos los campos son opcionales):**
```json
{
  "name": "Laptop Gaming Pro",
  "price": 1399.99,
  "stock": 3
}
```

**Ejemplo:**
```bash
curl -X PATCH http://localhost:3000/products/1 \
  -H "Content-Type: application/json" \
  -d '{"price": 1399.99}'
```

### 5. Eliminar Producto

**DELETE** `/products/:id`

Elimina un producto (soft delete - solo marca como inactivo).

**Ejemplo:**
```bash
curl -X DELETE http://localhost:3000/products/1
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Producto eliminado exitosamente"
}
```

---

## Endpoints de Embeddings

### 6. Generar Embedding de Imagen (desde Base64)

**POST** `/products/:id/generate-image-embedding`

Genera el embedding de imagen para un producto usando una imagen en base64.

**Body:**
```json
{
  "image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB...",
  "mime_type": "image/jpeg"
}
```

**Ejemplo:**
```bash
# Convertir imagen a base64 y generar embedding
BASE64_IMAGE=$(base64 -w 0 imagen.jpg)

curl -X POST http://localhost:3000/products/1/generate-image-embedding \
  -H "Content-Type: application/json" \
  -d "{\"image_base64\": \"$BASE64_IMAGE\", \"mime_type\": \"image/jpeg\"}"
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Laptop Gaming",
    "image_embedding": "[0.123, 0.456, ...]"
  },
  "message": "Embedding de imagen generado exitosamente"
}
```

### 7. Generar Embedding de Imagen (desde URL)

**POST** `/products/:id/generate-image-embedding-from-url`

Genera el embedding de imagen descargando la imagen desde la URL del producto.

**Nota:** El producto debe tener un `image_url` configurado.

**Ejemplo:**
```bash
curl -X POST http://localhost:3000/products/1/generate-image-embedding-from-url
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Laptop Gaming",
    "image_url": "https://ejemplo.com/laptop.jpg",
    "image_embedding": "[0.123, 0.456, ...]"
  },
  "message": "Embedding de imagen generado desde URL exitosamente"
}
```

### 8. Generar Embedding de Texto

**POST** `/products/:id/generate-text-embedding`

Genera el embedding de texto para un producto combinando nombre, descripción, categoría, marca y keywords.

**Ejemplo:**
```bash
curl -X POST http://localhost:3000/products/1/generate-text-embedding
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Laptop Gaming",
    "text_embedding": "[0.789, 0.012, ...]"
  },
  "message": "Embedding de texto generado exitosamente"
}
```

### 9. Buscar Productos Similares por Imagen

**POST** `/products/search-by-image`

Busca productos similares usando una imagen. Genera el embedding de la imagen y busca productos con embeddings similares usando distancia coseno.

**Body:**
```json
{
  "image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB...",
  "mime_type": "image/jpeg",
  "limit": 5
}
```

**Ejemplo:**
```bash
BASE64_IMAGE=$(base64 -w 0 laptop-buscar.jpg)

curl -X POST http://localhost:3000/products/search-by-image \
  -H "Content-Type: application/json" \
  -d "{
    \"image_base64\": \"$BASE64_IMAGE\",
    \"mime_type\": \"image/jpeg\",
    \"limit\": 5
  }"
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Laptop Gaming ASUS",
      "description": "Laptop de alto rendimiento",
      "price": 1299.99,
      "image_url": "https://ejemplo.com/laptop1.jpg"
    },
    {
      "id": 5,
      "name": "Laptop Dell Gaming",
      "description": "Laptop gaming potente",
      "price": 1399.99,
      "image_url": "https://ejemplo.com/laptop2.jpg"
    }
  ],
  "total": 2,
  "message": "Se encontraron 2 productos similares"
}
```

### 10. Generar Embeddings en Lote

**POST** `/products/batch-generate-embeddings`

Genera embeddings de imagen y texto para todos los productos que tienen `image_url` configurada.

**Ejemplo:**
```bash
curl -X POST http://localhost:3000/products/batch-generate-embeddings
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Proceso de generación de embeddings completado",
  "results": {
    "success": 15,
    "failed": 2,
    "errors": [
      "Producto 3: Failed to fetch image",
      "Producto 7: Invalid image format"
    ]
  }
}
```

---

## Flujo de Trabajo Completo

### Caso de Uso: Crear producto y habilitar búsqueda por imagen

```bash
# 1. Crear el producto
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Zapatillas Nike Air Max",
    "description": "Zapatillas deportivas cómodas",
    "price": 129.99,
    "stock": 20,
    "category": "Calzado",
    "brand": "Nike",
    "image_url": "https://ejemplo.com/nike-air-max.jpg",
    "keywords": ["zapatillas", "nike", "deportivas", "running"]
  }'

# Respuesta: {"success": true, "data": {"id": 1, ...}}

# 2. Generar embeddings desde la URL de la imagen
curl -X POST http://localhost:3000/products/1/generate-image-embedding-from-url

# 3. Generar embedding de texto
curl -X POST http://localhost:3000/products/1/generate-text-embedding

# 4. Ahora el producto está listo para búsqueda por imagen
# Buscar productos similares
BASE64_IMAGE=$(base64 -w 0 mi-zapato.jpg)
curl -X POST http://localhost:3000/products/search-by-image \
  -H "Content-Type: application/json" \
  -d "{\"image_base64\": \"$BASE64_IMAGE\", \"limit\": 5}"
```

### Caso de Uso: Generar embeddings para todos los productos existentes

```bash
# Si ya tienes productos con image_url, genera embeddings para todos
curl -X POST http://localhost:3000/products/batch-generate-embeddings
```

---

## Códigos de Estado HTTP

- `200 OK` - Operación exitosa
- `201 Created` - Producto creado exitosamente
- `400 Bad Request` - Datos inválidos en la solicitud
- `404 Not Found` - Producto no encontrado
- `500 Internal Server Error` - Error del servidor

---

## Notas Importantes

1. **Embeddings Requeridos**: Para que la búsqueda por imagen funcione, los productos deben tener sus `image_embedding` generados previamente.

2. **Formato de Imagen**: Las imágenes deben estar en formato base64 sin el prefijo `data:image/...;base64,`. Solo el contenido base64 puro.

3. **Tipos MIME Soportados**:
   - `image/jpeg`
   - `image/png`
   - `image/webp`

4. **Límites**:
   - El límite máximo para búsquedas es configurable (default: 5)
   - Las imágenes muy grandes pueden tardar más en procesarse

5. **Proceso en Lote**: El endpoint `batch-generate-embeddings` puede tardar varios minutos dependiendo del número de productos. Considera ejecutarlo en segundo plano para catálogos grandes.

---

## Ejemplos con JavaScript/TypeScript

### Buscar productos por imagen desde el frontend

```typescript
// Función para buscar productos similares
async function searchProductsByImage(imageFile: File) {
  // Convertir archivo a base64
  const base64 = await fileToBase64(imageFile);

  // Hacer la búsqueda
  const response = await fetch('http://localhost:3000/products/search-by-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_base64: base64,
      mime_type: imageFile.type,
      limit: 10,
    }),
  });

  const data = await response.json();
  return data.data; // Array de productos similares
}

// Función auxiliar para convertir File a base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

### Crear producto con embeddings

```typescript
async function createProductWithEmbeddings(productData: any, imageFile: File) {
  // 1. Crear el producto
  const createResponse = await fetch('http://localhost:3000/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });

  const { data: product } = await createResponse.json();

  // 2. Generar embedding de imagen
  const base64 = await fileToBase64(imageFile);
  await fetch(`http://localhost:3000/products/${product.id}/generate-image-embedding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_base64: base64,
      mime_type: imageFile.type,
    }),
  });

  // 3. Generar embedding de texto
  await fetch(`http://localhost:3000/products/${product.id}/generate-text-embedding`, {
    method: 'POST',
  });

  return product;
}
```

---

## Testing

Puedes usar el archivo `test-api.http` (compatible con REST Client de VS Code) para probar los endpoints:

```http
### 1. Listar productos
GET http://localhost:3000/products

### 2. Crear producto
POST http://localhost:3000/products
Content-Type: application/json

{
  "name": "Test Product",
  "price": 99.99,
  "image_url": "https://picsum.photos/200"
}

### 3. Generar embeddings desde URL
POST http://localhost:3000/products/1/generate-image-embedding-from-url

### 4. Buscar por imagen (reemplazar con base64 real)
POST http://localhost:3000/products/search-by-image
Content-Type: application/json

{
  "image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB...",
  "limit": 5
}
```
