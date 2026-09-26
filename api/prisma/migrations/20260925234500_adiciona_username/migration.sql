-- username e obrigatorio e unico, mas a tabela ja tem usuarios: entra
-- opcional, recebe um valor derivado do e-mail e so entao vira NOT NULL.

ALTER TABLE "users" ADD COLUMN "username" TEXT;

UPDATE "users" SET "username" = derivado.candidato
FROM (
  SELECT
    id,
    CASE WHEN ordem = 1 THEN base ELSE base || '_' || ordem::text END AS candidato
  FROM (
    SELECT
      id,
      base,
      ROW_NUMBER() OVER (PARTITION BY base ORDER BY "createdAt", id) AS ordem
    FROM (
      SELECT
        id,
        "createdAt",
        -- so letras, numeros e underscore; minimo de 3 caracteres, maximo de 16
        -- para sobrar espaco ao sufixo de desempate
        CASE
          WHEN length(limpo) >= 3 THEN left(limpo, 16)
          ELSE limpo || left(replace(id::text, '-', ''), 3 - length(limpo))
        END AS base
      FROM (
        SELECT
          id,
          "createdAt",
          COALESCE(
            NULLIF(regexp_replace(lower(split_part(email, '@', 1)), '[^a-z0-9_]', '', 'g'), ''),
            'usuario'
          ) AS limpo
        FROM "users"
      ) AS higienizado
    ) AS com_base
  ) AS numerado
) AS derivado
WHERE "users".id = derivado.id;

CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;
