# Glossaire Java ↔ TypeScript

**Date**: 28 octobre 2025  
**Public cible**: Développeurs Java migrant vers TypeScript ES2015  
**Objectif**: Faciliter la transition en établissant des correspondances

---

## 📋 Table des Matières

1. [Syntaxe de Base](#syntaxe-de-base)
2. [Classes et Objets](#classes-et-objets)
3. [Types et Interfaces](#types-et-interfaces)
4. [Modificateurs d'Accès](#modificateurs-daccès)
5. [Collections](#collections)
6. [Génériques](#génériques)
7. [Gestion d'Erreurs](#gestion-derreurs)
8. [Asynchrone](#asynchrone)
9. [Patterns de Conception](#patterns-de-conception)
10. [Outils et Build](#outils-et-build)
11. [Exemples Côte à Côte](#exemples-côte-à-côte)

---

## 1️⃣ Syntaxe de Base

| Concept | Java | TypeScript | Notes |
|---------|------|------------|-------|
| **Déclaration variable** | `String name = "John";` | `const name: string = "John"` | Préférer `const` (immutable) |
| **Variable mutable** | `String name = "John";` | `let name: string = "John"` | `let` pour variables mutables |
| **Constante** | `final String NAME = "John";` | `const NAME: string = "John"` | `const` = assignation unique |
| **Type primitif** | `int x = 5;` | `let x: number = 5` | Tous les nombres sont `number` |
| **Booléen** | `boolean flag = true;` | `let flag: boolean = true` | Identique |
| **Null/Undefined** | `String x = null;` | `let x: string \| null = null` | TS a aussi `undefined` |
| **Chaîne multiligne** | `String s = """...""";` (Java 15+) | `const s = \`...\`` | Template literals avec backticks |
| **Interpolation** | `String.format("Hello %s", name)` | `\`Hello ${name}\`` | Template literals |
| **Commentaire** | `// Comment` ou `/* ... */` | `// Comment` ou `/* ... */` | Identique |
| **Documentation** | `/** JavaDoc */` | `/** JSDoc */` | Syntaxe identique |

---

## 2️⃣ Classes et Objets

### Déclaration de Classe

| Concept | Java | TypeScript |
|---------|------|------------|
| **Classe simple** | `public class Person { }` | `export class Person { }` |
| **Propriété** | `private String name;` | `private name: string` |
| **Propriété readonly** | `private final String name;` | `private readonly name: string` |
| **Constructeur** | `public Person(String name) { this.name = name; }` | `constructor(private name: string) { }` |
| **Méthode** | `public void greet() { }` | `public greet(): void { }` |
| **Méthode statique** | `public static void main() { }` | `public static main(): void { }` |
| **this** | `this.name` | `this.name` |
| **super** | `super()` | `super()` |

### Exemple Complet

```java
// Java
public class Person {
    private final String name;
    private int age;
    
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    public void greet() {
        System.out.println("Hello, I'm " + this.name);
    }
    
    public int getAge() {
        return this.age;
    }
    
    public void setAge(int age) {
        this.age = age;
    }
}

// Utilisation
Person p = new Person("Alice", 30);
p.greet();
```

```typescript
// TypeScript
export class Person {
    private age: number
    
    constructor(
        private readonly name: string,
        age: number
    ) {
        this.age = age
    }
    
    public greet(): void {
        console.log(`Hello, I'm ${this.name}`)
    }
    
    public getAge(): number {
        return this.age
    }
    
    public setAge(age: number): void {
        this.age = age
    }
}

// Utilisation
const p = new Person("Alice", 30)
p.greet()
```

**Différences clés** :
- ✅ TypeScript permet d'inférer les types (mais mieux les expliciter)
- ✅ Paramètres du constructeur avec modificateurs = propriétés auto-créées
- ✅ Pas de `System.out.println` → `console.log`
- ✅ `const` au lieu de type pour instanciation

---

## 3️⃣ Types et Interfaces

| Concept | Java | TypeScript |
|---------|------|------------|
| **Interface** | `interface MyInterface { void method(); }` | `interface MyInterface { method(): void }` |
| **Implements** | `class X implements Y { }` | `class X implements Y { }` |
| **Extends** | `class X extends Y { }` | `class X extends Y { }` |
| **Multiple interfaces** | `class X implements A, B { }` | `class X implements A, B { }` |
| **Type alias** | N/A | `type ID = string \| number` |
| **Union type** | N/A | `let x: string \| number` |
| **Optional** | `Optional<String>` | `string \| null` ou `string \| undefined` |
| **Casting** | `(String) object` | `object as string` ou `<string>object` |

### Exemple Interface

```java
// Java
public interface Vehicle {
    void start();
    void stop();
    int getSpeed();
}

public class Car implements Vehicle {
    private int speed = 0;
    
    @Override
    public void start() {
        System.out.println("Car starting");
    }
    
    @Override
    public void stop() {
        this.speed = 0;
    }
    
    @Override
    public int getSpeed() {
        return this.speed;
    }
}
```

```typescript
// TypeScript
export interface Vehicle {
    start(): void
    stop(): void
    getSpeed(): number
}

export class Car implements Vehicle {
    private speed: number = 0
    
    public start(): void {
        console.log("Car starting")
    }
    
    public stop(): void {
        this.speed = 0
    }
    
    public getSpeed(): number {
        return this.speed
    }
}
```

**Particularité TypeScript** :
```typescript
// Type alias (n'existe pas en Java)
type Point = { x: number, y: number }
type ID = string | number

// Interface vs Type
interface Person {
    name: string
}

type PersonType = {
    name: string
}

// Les deux sont équivalents, mais `interface` est préféré pour les objets
```

---

## 4️⃣ Modificateurs d'Accès

| Modificateur | Java | TypeScript | Différences |
|--------------|------|------------|-------------|
| **Public** | `public String name;` | `public name: string` | Identique (par défaut en TS) |
| **Private** | `private String name;` | `private name: string` | Identique |
| **Protected** | `protected String name;` | `protected name: string` | Identique |
| **Package-private** | `String name;` (pas de modificateur) | N/A | N'existe pas en TS |
| **Final (propriété)** | `private final String name;` | `private readonly name: string` | `readonly` = immutable |
| **Final (classe)** | `public final class X { }` | N/A | Pas de classes `final` en TS |
| **Static** | `public static int count;` | `public static count: number` | Identique |

**Important** : En TypeScript, `private` est uniquement au niveau du compilateur. En runtime, tout est accessible. Pour une vraie encapsulation, utiliser les champs privés ES2022 (`#field`).

```typescript
class Example {
    // Ancien style (compile-time only)
    private oldPrivate: string = "accessible en runtime"
    
    // Nouveau style ES2022 (vraiment privé en runtime)
    #newPrivate: string = "inaccessible en runtime"
    
    public test(): void {
        console.log(this.#newPrivate)  // OK
    }
}

const e = new Example()
console.log(e.oldPrivate)  // Erreur TypeScript, mais fonctionne en JS
console.log(e.#newPrivate)  // Erreur syntaxe JS
```

---

## 5️⃣ Collections

| Collection | Java | TypeScript | Notes |
|------------|------|------------|-------|
| **Array** | `String[] arr = new String[10];` | `const arr: string[] = []` | Arrays dynamiques en TS |
| **List** | `List<String> list = new ArrayList<>();` | `const list: string[] = []` | Arrays natifs |
| **Map** | `Map<String, Integer> map = new HashMap<>();` | `const map = new Map<string, number>()` | ES2015 Map |
| **Set** | `Set<String> set = new HashSet<>();` | `const set = new Set<string>()` | ES2015 Set |
| **Ajouter élément** | `list.add("item");` | `list.push("item")` | `push` pour arrays |
| **Retirer élément** | `list.remove("item");` | `list.splice(index, 1)` | Différent ! |
| **Taille** | `list.size();` | `list.length` | Propriété, pas méthode |
| **Itérer** | `for (String s : list) { }` | `for (const s of list) { }` | `of` pas `in` |

### Exemples

```java
// Java
List<String> names = new ArrayList<>();
names.add("Alice");
names.add("Bob");

for (String name : names) {
    System.out.println(name);
}

Map<String, Integer> ages = new HashMap<>();
ages.put("Alice", 30);
ages.put("Bob", 25);

for (Map.Entry<String, Integer> entry : ages.entrySet()) {
    System.out.println(entry.getKey() + ": " + entry.getValue());
}
```

```typescript
// TypeScript
const names: string[] = []
names.push("Alice")
names.push("Bob")

for (const name of names) {
    console.log(name)
}

// Ou avec forEach
names.forEach(name => console.log(name))

const ages = new Map<string, number>()
ages.set("Alice", 30)
ages.set("Bob", 25)

for (const [name, age] of ages.entries()) {
    console.log(`${name}: ${age}`)
}

// Ou avec forEach
ages.forEach((age, name) => console.log(`${name}: ${age}`))
```

**Méthodes fonctionnelles** :
```typescript
// TypeScript a des méthodes fonctionnelles puissantes
const numbers = [1, 2, 3, 4, 5]

// map (équivalent Java Stream.map)
const doubled = numbers.map(n => n * 2)  // [2, 4, 6, 8, 10]

// filter (équivalent Java Stream.filter)
const evens = numbers.filter(n => n % 2 === 0)  // [2, 4]

// reduce (équivalent Java Stream.reduce)
const sum = numbers.reduce((acc, n) => acc + n, 0)  // 15

// find
const found = numbers.find(n => n > 3)  // 4

// some (équivalent Java Stream.anyMatch)
const hasEven = numbers.some(n => n % 2 === 0)  // true

// every (équivalent Java Stream.allMatch)
const allPositive = numbers.every(n => n > 0)  // true
```

---

## 6️⃣ Génériques

| Concept | Java | TypeScript |
|---------|------|------------|
| **Classe générique** | `class Box<T> { }` | `class Box<T> { }` |
| **Méthode générique** | `public <T> void method(T item) { }` | `public method<T>(item: T): void { }` |
| **Contrainte** | `<T extends Number>` | `<T extends number>` |
| **Type borné** | `<T extends Comparable<T>>` | `<T extends { compare(other: T): number }>` |
| **Utilisation** | `Box<String> box = new Box<>();` | `const box = new Box<string>()` |

### Exemple

```java
// Java
public class Container<T> {
    private T value;
    
    public Container(T value) {
        this.value = value;
    }
    
    public T getValue() {
        return this.value;
    }
    
    public void setValue(T value) {
        this.value = value;
    }
}

// Utilisation
Container<String> stringContainer = new Container<>("Hello");
String value = stringContainer.getValue();
```

```typescript
// TypeScript
export class Container<T> {
    constructor(private value: T) {}
    
    public getValue(): T {
        return this.value
    }
    
    public setValue(value: T): void {
        this.value = value
    }
}

// Utilisation
const stringContainer = new Container<string>("Hello")
const value = stringContainer.getValue()  // TypeScript infère string
```

**Contraintes** :
```typescript
// Contrainte simple
function process<T extends { id: number }>(item: T): void {
    console.log(item.id)
}

// Multiple contraintes
interface HasId {
    id: number
}

interface HasName {
    name: string
}

function display<T extends HasId & HasName>(item: T): void {
    console.log(`${item.id}: ${item.name}`)
}
```

---

## 7️⃣ Gestion d'Erreurs

| Concept | Java | TypeScript |
|---------|------|------------|
| **Lever exception** | `throw new Exception("Error");` | `throw new Error("Error")` |
| **Try-catch** | `try { } catch (Exception e) { }` | `try { } catch (error) { }` |
| **Finally** | `finally { }` | `finally { }` |
| **Exception personnalisée** | `class MyException extends Exception { }` | `class MyError extends Error { }` |
| **Checked exception** | `throws IOException` | N/A (pas de checked exceptions) |

### Exemple

```java
// Java
public class MyService {
    public void process() throws IOException {
        try {
            // Code risqué
            readFile();
        } catch (FileNotFoundException e) {
            System.err.println("File not found: " + e.getMessage());
            throw e;
        } catch (IOException e) {
            System.err.println("IO error: " + e.getMessage());
            throw new RuntimeException("Processing failed", e);
        } finally {
            cleanup();
        }
    }
    
    private void readFile() throws IOException {
        // ...
    }
    
    private void cleanup() {
        // ...
    }
}
```

```typescript
// TypeScript
export class MyService {
    public process(): void {
        try {
            // Code risqué
            this.readFile()
        } catch (error) {
            if (error instanceof FileNotFoundError) {
                console.error(`File not found: ${error.message}`)
                throw error
            }
            
            console.error(`IO error: ${(error as Error).message}`)
            throw new Error(`Processing failed: ${(error as Error).message}`)
        } finally {
            this.cleanup()
        }
    }
    
    private readFile(): void {
        // Peut lever une erreur
        throw new FileNotFoundError("file.txt")
    }
    
    private cleanup(): void {
        // Nettoyage
    }
}

// Exception personnalisée
class FileNotFoundError extends Error {
    constructor(filename: string) {
        super(`File not found: ${filename}`)
        this.name = 'FileNotFoundError'
    }
}
```

**Important** : TypeScript n'a pas de "checked exceptions". On ne peut pas forcer l'appelant à gérer les erreurs au compile-time.

---

## 8️⃣ Asynchrone

| Concept | Java | TypeScript |
|---------|------|------------|
| **Future** | `CompletableFuture<String>` | `Promise<string>` |
| **Async method** | N/A (verbose avec callbacks) | `async function f(): Promise<T> { }` |
| **Await** | `.thenApply()`, `.thenCompose()` | `await promise` |
| **All** | `CompletableFuture.allOf()` | `Promise.all([...])` |
| **Any** | `CompletableFuture.anyOf()` | `Promise.race([...])` |

### Exemple

```java
// Java (verbose)
public CompletableFuture<String> fetchData() {
    return CompletableFuture.supplyAsync(() -> {
        // Simulation appel API
        return "data";
    }).thenApply(data -> {
        return data.toUpperCase();
    }).exceptionally(ex -> {
        System.err.println("Error: " + ex.getMessage());
        return "default";
    });
}

// Utilisation
fetchData().thenAccept(result -> {
    System.out.println(result);
});
```

```typescript
// TypeScript (concis avec async/await)
export async function fetchData(): Promise<string> {
    try {
        // Simulation appel API
        const data = await simulateApiCall()
        return data.toUpperCase()
    } catch (error) {
        console.error(`Error: ${(error as Error).message}`)
        return "default"
    }
}

async function simulateApiCall(): Promise<string> {
    return new Promise(resolve => {
        setTimeout(() => resolve("data"), 1000)
    })
}

// Utilisation
const result = await fetchData()
console.log(result)

// Ou avec .then()
fetchData().then(result => {
    console.log(result)
})
```

**Promise.all** :
```typescript
// Exécuter plusieurs promises en parallèle
const [user, posts, comments] = await Promise.all([
    fetchUser(id),
    fetchPosts(id),
    fetchComments(id)
])
```

---

## 9️⃣ Patterns de Conception

### Singleton

| Java | TypeScript |
|------|------------|
| ```java<br>public class Singleton {<br>    private static Singleton instance;<br>    <br>    private Singleton() {}<br>    <br>    public static Singleton getInstance() {<br>        if (instance == null) {<br>            instance = new Singleton();<br>        }<br>        return instance;<br>    }<br>}<br>``` | ```typescript<br>export class Singleton {<br>    private static instance: Singleton \| null = null<br>    <br>    private constructor() {}<br>    <br>    public static getInstance(): Singleton {<br>        if (!Singleton.instance) {<br>            Singleton.instance = new Singleton()<br>        }<br>        return Singleton.instance<br>    }<br>}<br>``` |

### Builder

| Java | TypeScript |
|------|------------|
| ```java<br>public class Person {<br>    private String name;<br>    private int age;<br>    <br>    private Person(Builder builder) {<br>        this.name = builder.name;<br>        this.age = builder.age;<br>    }<br>    <br>    public static class Builder {<br>        private String name;<br>        private int age;<br>        <br>        public Builder name(String name) {<br>            this.name = name;<br>            return this;<br>        }<br>        <br>        public Builder age(int age) {<br>            this.age = age;<br>            return this;<br>        }<br>        <br>        public Person build() {<br>            return new Person(this);<br>        }<br>    }<br>}<br><br>// Utilisation<br>Person p = new Person.Builder()<br>    .name("Alice")<br>    .age(30)<br>    .build();<br>``` | ```typescript<br>export class Person {<br>    private constructor(<br>        private readonly name: string,<br>        private readonly age: number<br>    ) {}<br>    <br>    public static builder(): PersonBuilder {<br>        return new PersonBuilder()<br>    }<br>}<br><br>class PersonBuilder {<br>    private name: string = ""<br>    private age: number = 0<br>    <br>    public withName(name: string): this {<br>        this.name = name<br>        return this<br>    }<br>    <br>    public withAge(age: number): this {<br>        this.age = age<br>        return this<br>    }<br>    <br>    public build(): Person {<br>        return new Person(this.name, this.age)<br>    }<br>}<br><br>// Utilisation<br>const p = Person.builder()<br>    .withName("Alice")<br>    .withAge(30)<br>    .build()<br>``` |

---

## 🔟 Outils et Build

| Outil | Java | TypeScript/JavaScript |
|-------|------|-----------------------|
| **Gestionnaire de paquets** | Maven (`pom.xml`), Gradle | npm (`package.json`), yarn, pnpm |
| **Build tool** | Maven, Gradle | Vite, Webpack, esbuild |
| **Compilateur** | `javac` | `tsc` (TypeScript Compiler) |
| **Runtime** | JVM | Node.js (serveur), Browser (client) |
| **Tests** | JUnit, TestNG | Vitest, Jest, Mocha |
| **Linting** | Checkstyle, PMD | ESLint |
| **Formatting** | Google Java Format | Prettier |
| **Documentation** | JavaDoc | JSDoc, TypeDoc |

---

## 1️⃣1️⃣ Exemples Côte à Côte

### Service avec Singleton + DI

```java
// Java
@Service
public class UserService {
    private final UserRepository repository;
    private final Logger logger;
    
    @Autowired
    public UserService(UserRepository repository, Logger logger) {
        this.repository = repository;
        this.logger = logger;
    }
    
    public Optional<User> findById(Long id) {
        logger.info("Fetching user {}", id);
        
        try {
            return repository.findById(id);
        } catch (Exception e) {
            logger.error("Error fetching user", e);
            throw new ServiceException("Failed to fetch user", e);
        }
    }
}
```

```typescript
// TypeScript
export class UserService {
    private constructor(
        private readonly repository: UserRepository,
        private readonly logger: LoggerService
    ) {}
    
    public findById(id: number): User | null {
        this.logger.info('user-service', `Fetching user ${id}`)
        
        try {
            return this.repository.findById(id)
        } catch (error) {
            this.logger.error('user-service', 'Error fetching user', error)
            throw new ServiceError('Failed to fetch user', { cause: error })
        }
    }
    
    // Singleton
    private static instance: UserService | null = null
    
    public static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService(
                UserRepository.getInstance(),
                LoggerService.getInstance()
            )
        }
        return UserService.instance
    }
}

export const userService = UserService.getInstance()
```

---

### Controller REST

```java
// Java Spring
@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;
    
    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        return userService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User created = userService.create(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
```

```typescript
// TypeScript Express (équivalent)
import { Router, Request, Response } from 'express'

export class UserController {
    private router: Router
    
    constructor(private userService: UserService) {
        this.router = Router()
        this.setupRoutes()
    }
    
    private setupRoutes(): void {
        this.router.get('/:id', this.getUser.bind(this))
        this.router.post('/', this.createUser.bind(this))
    }
    
    private getUser(req: Request, res: Response): void {
        const id = parseInt(req.params.id)
        const user = this.userService.findById(id)
        
        if (user) {
            res.json(user)
        } else {
            res.status(404).send()
        }
    }
    
    private createUser(req: Request, res: Response): void {
        const user = this.userService.create(req.body)
        res.status(201).json(user)
    }
    
    public getRouter(): Router {
        return this.router
    }
}

// Utilisation
const controller = new UserController(userService)
app.use('/api/users', controller.getRouter())
```

---

## 📝 Résumé des Différences Clés

### Similitudes
- ✅ Classes ES2015 quasi-identiques à Java
- ✅ Interfaces et héritage fonctionnent pareil
- ✅ Modificateurs `public`, `private`, `protected`
- ✅ Génériques similaires
- ✅ Try-catch-finally identique

### Différences Importantes
- ⚠️ **Pas de packages** : Organisation par dossiers
- ⚠️ **Pas de checked exceptions** : Pas de `throws`
- ⚠️ **Pas de surcharge de méthodes** : Utiliser paramètres optionnels
- ⚠️ **Types optionnels** : `T | null` au lieu de `Optional<T>`
- ⚠️ **Collections natives** : Array, Map, Set (pas ArrayList, HashMap)
- ⚠️ **Async/Await** : Beaucoup plus simple que CompletableFuture
- ⚠️ **DI manuelle** : Pas de `@Autowired` automatique

### Avantages TypeScript
- 🚀 **Async/Await** : Code asynchrone plus lisible
- 🚀 **Union Types** : `string | number` (flexibilité)
- 🚀 **Template Literals** : Interpolation native
- 🚀 **Destructuring** : `const { name, age } = person`
- 🚀 **Spread operator** : `[...array1, ...array2]`
- 🚀 **Optional Chaining** : `obj?.prop?.nested`
- 🚀 **Nullish Coalescing** : `value ?? defaultValue`

### Avantages Java
- 💪 **Checked Exceptions** : Sécurité compile-time
- 💪 **True Encapsulation** : `private` vraiment privé en runtime
- 💪 **Multithreading** : Support natif robuste
- 💪 **Performance** : JVM optimisée
- 💪 **Écosystème mature** : Spring, Hibernate, etc.

---

## 🎓 Conseils pour Développeurs Java

1. **Pensez "const par défaut"** : Immutabilité encouragée
2. **Utilisez `readonly`** : Équivalent de `final` pour propriétés
3. **Exploitez async/await** : Plus simple que Java
4. **Documentez avec JSDoc** : Même syntaxe que JavaDoc
5. **Préférez interfaces** : Pour définir des contrats
6. **Injection manuelle** : Pas de framework DI magique
7. **Tests unitaires** : Vitest ≈ JUnit, même philosophie
8. **Typage strict** : Activez `strict: true` dans `tsconfig.json`

---

**Fin du glossaire**
